
import { GoogleGenAI, Type } from '@google/genai';
import type { Article, Briefing, Topic, NewsSection, TimelineEvent, UpcomingMeeting, GroundingChunk, Entity, Relationship } from '../types';

// --- Initialize the Google GenAI Client ---
// The SDK is designed to correctly read the API_KEY from the environment.
const GOOGLE_API_KEY = process.env.API_KEY!;
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const model = 'gemini-2.5-flash';

// --- Custom Error for Quota ---
export class QuotaExceededError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QuotaExceededError';
    }
}

// --- Helper Functions for Retries and Error Checking ---
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isQuotaError(error: any): boolean {
    try {
        if (error.message) {
             const errorStr = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
             // Check for Google's 429 error
             if (errorStr.includes('429') && (errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota'))) {
                 return true;
             }
             // Check for OpenRouter's 429 error (as a fallback)
             if(error.status === 429) return true;
        }
    } catch { /* ignore parsing errors */ }
    return false;
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
    initialDelay = 1500,
    backoffFactor = 2
): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            // If it's a quota error, we don't retry, we fail fast to the fallback
            if (isQuotaError(error)) {
                 console.warn("Quota error detected, failing fast for fallback mechanism.");
                 throw error; // Re-throw to be caught by the main handler
            }

            if (i < retries - 1) {
                console.warn(`Retryable error received. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await sleep(delay + Math.random() * 500); // Add jitter
                delay *= backoffFactor;
            } else {
                console.error(`Final attempt failed or error is not retryable.`, error);
                throw error;
            }
        }
    }
    throw new Error("Exceeded maximum retries.");
}


// --- API Callers for Different Providers ---

// Google AI SDK Caller (JSON response)
async function callGoogleGenerativeModel<T>(prompt: string, responseSchema: any): Promise<T> {
    const fn = async () => {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema,
            },
        });
        return JSON.parse(result.text) as T;
    };
    return retryWithBackoff(fn);
}

// Google AI SDK Caller (Grounded)
async function callGoogleGroundedModel<T>(prompt: string): Promise<{ data: T; sources: GroundingChunk[] }> {
    const fn = async () => {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });

        const responseText = result.text;
        const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch || !jsonMatch[1]) throw new Error('Failed to parse JSON from grounded model response.');
        
        const jsonData = JSON.parse(jsonMatch[1]);
        return { data: jsonData as T, sources };
    };
    return retryWithBackoff(fn);
}

// OpenRouter Caller (handles both grounded and non-grounded via prompt instructions)
async function callOpenRouterModel<T>(prompt: string, apiKey: string): Promise<{ data: T, sources: GroundingChunk[] }> {
    const fn = async () => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash", 
                messages: [{ role: "user", content: prompt }],
            })
        });

        if (!response.ok) {
            let errorText = `OpenRouter API request failed with status ${response.status}`;
            try {
                const errorBody = await response.json();
                console.error("OpenRouter API Error Body:", errorBody);
                if (typeof errorBody.error?.message === 'string') {
                    errorText = errorBody.error.message;
                } else if (errorBody.error) {
                    errorText = JSON.stringify(errorBody.error);
                }
            } catch (e) {
                // The body might not be JSON, just use the status.
            }
            throw new Error(errorText);
        }

        const result = await response.json();
        const responseText = result.choices[0].message.content;
        
        const sources: GroundingChunk[] = []; 
        
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;

        try {
            const jsonData = JSON.parse(jsonString);
            return { data: jsonData, sources };
        } catch (e) {
            console.error("Failed to parse JSON from OpenRouter:", jsonString, e);
            throw new Error("Invalid JSON received from OpenRouter.");
        }
    };
    return retryWithBackoff(fn);
}


// --- Unified API Functions with Fallback Logic ---

interface AnalysisReport {
    articles: (Omit<Article, 'isAnalyzed' | 'isBookmarked'> & { entities: Entity[] })[];
    graph: {
        entities: Entity[];
        relationships: Relationship[];
    };
}

export async function fetchAndAnalyzeTopic(topicName: string, query: string, openRouterApiKey: string): Promise<{ data: Pick<NewsSection, 'articles' | 'sources' | 'entities' | 'relationships'>, usedFallback: boolean }> {
    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `As a top-tier intelligence analyst, your task is to investigate a topic and compile a complete intelligence report in a single step.
The current date is ${currentDate}. All information must be as recent as possible.

TOPIC: "${topicName}"
INVESTIGATION FOCUS: "${query}"

INSTRUCTIONS:
1. Perform a web search to find 5-7 significant articles published within the last 36 hours relative to the current date.
2. For EACH article found, read its content and generate:
    a. A concise, one-sentence summary in both English ("summary_en") and Chinese ("summary_zh").
    b. A list of key entities mentioned ("entities"), each with an "id", "name", and "type".
3. From ALL articles combined, generate a consolidated knowledge graph. This graph should contain:
    a. "entities": A de-duplicated list of all unique entities.
    b. "relationships": A list of connections, where each has a "source" (entity id), "target" (entity id), and a descriptive "label".
4. Respond with a single JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
5. The JSON object must have a single top-level key: "report".
6. The "report" object must contain:
    - "articles": An array of article objects. Each object must have "title", "url", "publishedAt", "summary_en", "summary_zh", and "entities".
    - "graph": The consolidated knowledge graph object with its "entities" and "relationships".

Ensure all data is derived directly from the content of the articles you find.`;

    let result;
    let usedFallback = false;
    try {
        result = await callGoogleGroundedModel<{ report: AnalysisReport }>(prompt);
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Google quota exceeded for fetchAndAnalyzeTopic. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key to continue.");
            result = await callOpenRouterModel<{ report: AnalysisReport }>(prompt, openRouterApiKey);
            usedFallback = true;
        } else {
            throw error;
        }
    }

    const report = result.data.report || { articles: [], graph: { entities: [], relationships: [] } };
    const enrichedArticles = report.articles.map(article => ({ ...article, isAnalyzed: true }));
    const data = {
        articles: enrichedArticles,
        sources: result.sources,
        entities: report.graph.entities || [],
        relationships: report.graph.relationships || [],
    };
    return { data, usedFallback };
}

export async function discoverAndAnalyzeMore(query: string, existingArticles: Article[], openRouterApiKey: string): Promise<{ data: Pick<NewsSection, 'articles' | 'sources' | 'entities' | 'relationships'>, usedFallback: boolean }> {
    const currentDate = new Date().toISOString().split('T')[0];
    const existingArticleUrls = existingArticles.map(a => `- ${a.url}`).join('\n');
    const prompt = `As a top-tier intelligence analyst, you are continuing an investigation. Find and analyze NEW articles related to the topic.
The current date is ${currentDate}.

INVESTIGATION FOCUS: "${query}"

EXISTING ARTICLES (to avoid duplication):
${existingArticleUrls}

INSTRUCTIONS:
1. Perform a web search to find 3-5 NEW, significant articles about the investigation focus, published recently. DO NOT include any of the existing articles listed above.
2. For each NEW article, read its content and generate:
    a. A concise, one-sentence summary in English ("summary_en") and Chinese ("summary_zh").
    b. A list of key entities mentioned ("entities").
3. From the NEW articles, generate a knowledge graph containing "entities" and "relationships".
4. Respond with a single JSON object inside a markdown code block (\`\`\`json ... \`\`\`), with a single top-level key "report".

Provide only fresh information.`;

    let result;
    let usedFallback = false;
    try {
        result = await callGoogleGroundedModel<{ report: AnalysisReport }>(prompt);
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Google quota exceeded for discoverAndAnalyzeMore. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            result = await callOpenRouterModel<{ report: AnalysisReport }>(prompt, openRouterApiKey);
            usedFallback = true;
        } else {
            throw error;
        }
    }
    
    const report = result.data.report || { articles: [], graph: { entities: [], relationships: [] } };
    const newArticles = report.articles.map(article => ({ ...article, isAnalyzed: true }));
    const data = {
        articles: newArticles,
        sources: result.sources,
        entities: report.graph.entities || [],
        relationships: report.graph.relationships || [],
    };
    return { data, usedFallback };
}


export async function fetchUpcomingMeetings(openRouterApiKey: string): Promise<{ data: Omit<UpcomingMeeting, 'id'>[], usedFallback: boolean }> {
    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `As an intelligence analyst, perform a web search to find 5-7 significant UPCOMING international meetings.
The current date is ${currentDate}. The search should focus on events scheduled after this date for the rest of the current year. Focus on high-level engagements (e.g., G7, APEC, NATO, SCO, ASEAN Summits, major state visits). Sort them chronologically.

Respond with a JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
The object should contain a "meetings" key, which is an array. Each object in the array must have:
- eventName_en / eventName_zh
- participants (array of strings)
- dateText (e.g., "Late October 2024")
- dateISO (e.g., "2024-10-25")
- location_en / location_zh
- focus_en / focus_zh (a brief summary)
- involvesChina (boolean)`;
    
    let usedFallback = false;
    try {
        const { data } = await callGoogleGroundedModel<{ meetings: Omit<UpcomingMeeting, 'id'>[] }>(prompt);
        return { data: data.meetings || [], usedFallback };
    } catch (error) {
         if (isQuotaError(error)) {
            console.warn("Google quota exceeded for fetchUpcomingMeetings. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            usedFallback = true;
            const { data } = await callOpenRouterModel<{ meetings: Omit<UpcomingMeeting, 'id'>[] }>(prompt, openRouterApiKey);
            return { data: data.meetings || [], usedFallback };
        } else {
            throw error;
        }
    }
}

const briefingSchema = { type: Type.OBJECT, properties: { summary_en: { type: Type.STRING }, summary_zh: { type: Type.STRING } } };
export async function generateDailyBriefing(articles: Article[], openRouterApiKey: string): Promise<{ data: Briefing, usedFallback: boolean }> {
    const briefingContext = articles.filter(a => a.summary_en).map(a => `- Title: ${a.title}\n  URL: ${a.url}\n  Summary: ${a.summary_en}`).join('\n\n');
    const prompt = `As a geopolitical intelligence analyst, synthesize the following article summaries into a high-level briefing.

**Instructions:**
1.  Respond with a single JSON object.
2.  The JSON object must have two keys: "summary_en" and "summary_zh".
3.  The value for each key should be a string containing a markdown-formatted briefing.
4.  The briefing must include the following sections, precisely as named and formatted:
    -   \`**Executive Summary:**\` (1-2 concise sentences summarizing the overall situation).
    -   \`**Key Developments:**\` (A bulleted list of 3-5 of the most important events or data points. Use '*' for bullets).
    -   \`**Strategic Implication:**\` (A single sentence on the potential future impact or significance).
5.  Where relevant, cite the source article for a development using a markdown link like \`[Source]({URL})\`.

**Article Summaries to Analyze:**
${briefingContext}`;

    let usedFallback = false;
    try {
        const data = await callGoogleGenerativeModel<Briefing>(prompt, briefingSchema);
        return { data, usedFallback };
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Google quota exceeded for generateDailyBriefing. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            usedFallback = true;
            const { data } = await callOpenRouterModel<{summary_en: string, summary_zh: string}>(prompt, openRouterApiKey);
            return { data, usedFallback };
        } else {
            throw error;
        }
    }
}

const timelineSchema = { type: Type.OBJECT, properties: { events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, event: { type: Type.STRING } }, required: ['date', 'event'] } } } };
export async function fetchEventTimeline(articles: Article[], openRouterApiKey: string): Promise<{ data: TimelineEvent[], usedFallback: boolean }> {
    const articleContext = articles.filter(a => a.summary_en).map(a => `- Title: ${a.title}\n  Summary: ${a.summary_en}`).join('\n\n');
    const prompt = `As an intelligence analyst, analyze the provided article summaries to extract and order key events chronologically.

**Instructions:**
1.  Respond with a single JSON object with one key: "events".
2.  The "events" value must be an array of objects, where each object has \`"date"\` and \`"event"\`.
3.  Synthesize information to create a coherent, chronological timeline. Only include events clearly identified.
4.  If no clear sequence can be determined, return an empty "events" array.

**Article Summaries to Analyze:**
${articleContext}`;

    let result;
    let usedFallback = false;
    try {
        result = await callGoogleGenerativeModel<{events: TimelineEvent[]}>(prompt, timelineSchema);
    } catch (error) {
         if (isQuotaError(error)) {
            console.warn("Google quota exceeded for fetchEventTimeline. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            usedFallback = true;
            const { data } = await callOpenRouterModel<{events: TimelineEvent[]}>(prompt, openRouterApiKey);
            result = data;
        } else {
            throw error;
        }
    }

    const sortedEvents = (result.events || []).sort((a, b) => {
        try {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA.getTime() - dateB.getTime();
            }
        } catch(e) { /* Ignore parsing errors */ }
        return 0;
    });
    return { data: sortedEvents, usedFallback };
}


const suggestionsSchema = { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } };
export async function getRelatedTopicSuggestions(existingTopics: Topic[], openRouterApiKey: string): Promise<{ data: string[], usedFallback: boolean }> {
    const prompt = `Based on these topics: ${existingTopics.map(t => t.query).join(', ')}, suggest 5 related, specific geopolitical topics to monitor. Respond with a JSON object.`;
    let usedFallback = false;
    try {
        const data = await callGoogleGenerativeModel<{suggestions: string[]}>(prompt, suggestionsSchema);
        return { data: data.suggestions || [], usedFallback };
    } catch (error) {
        if (isQuotaError(error)) {
            console.warn("Google quota exceeded for getRelatedTopicSuggestions. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            usedFallback = true;
            const { data } = await callOpenRouterModel<{suggestions: string[]}>(prompt, openRouterApiKey);
            return { data: data.suggestions || [], usedFallback };
        } else {
            throw error;
        }
    }
}

export async function getTrendingTopicSuggestions(openRouterApiKey: string): Promise<{ data: string[], usedFallback: boolean }> {
    const currentDate = new Date().toISOString().split('T')[0];
    const prompt = `As a geopolitical analyst, perform a web search to identify 5 current, major international news topics.
The current date is ${currentDate}. Topics must be based on news from the last 48 hours.
Examples: 'Texas Flooding Crisis', 'Sudan Peace Talks'. Topics must be concise search queries.
    
Respond with a JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
The object should contain a single key "suggestions" which is an array of 5 strings.`;
    let usedFallback = false;
    try {
        const { data } = await callGoogleGroundedModel<{suggestions:string[]}>(prompt);
        return { data: data.suggestions || [], usedFallback };
    } catch (error) {
         if (isQuotaError(error)) {
            console.warn("Google quota exceeded for getTrendingTopicSuggestions. Falling back to OpenRouter.");
            if (!openRouterApiKey) throw new QuotaExceededError("Google API quota exceeded. Please configure the OpenRouter API key.");
            usedFallback = true;
            const { data } = await callOpenRouterModel<{suggestions:string[]}>(prompt, openRouterApiKey);
            return { data: data.suggestions || [], usedFallback };
        } else {
            throw error;
        }
    }
}
