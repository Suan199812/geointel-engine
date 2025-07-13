

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ArticleList } from './components/ArticleList';
import { ErrorMessage } from './components/ErrorMessage';
import * as apiService from './services/apiService';
import type { Article, Topic, Language, Briefing, Entity, NewsSection, TimelineEvent, UpcomingMeeting } from './types';
import { Welcome } from './components/Welcome';
import { BriefingModal } from './components/BriefingModal';
import { TopicManager } from './components/TopicManager';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { EntityPanel } from './components/EntityPanel';
import { ArticleListSkeleton } from './components/ArticleListSkeleton';
import { TimelineModal } from './components/TimelineModal';
import { MeetingsList } from './components/MeetingsList';
import { SourceList } from './components/SourceList';
import { FallbackApiModal } from './components/FallbackApiModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

type ViewMode = 'list' | 'graph' | 'bookmarks';
type ToastMessage = { message: string; type: 'info' | 'error' | 'success' };
type FailedAction = 'FETCH_TOPIC' | 'DISCOVER_MORE' | 'GET_BRIEFING' | 'GET_TIMELINE' | 'FETCH_MEETINGS' | 'FETCH_RELATED_SUGGESTIONS' | 'FETCH_TRENDING_SUGGESTIONS';


const initialTopics: Topic[] = [
    { id: 'us-china-relations', name: 'US-China Relations', query: 'Latest analysis on US-China geopolitical, economic, and military relations, including policy shifts and high-level meetings.' },
    { id: 'donald-trump', name: 'Donald Trump', query: 'Recent news, statements, and political activities related to Donald Trump and his influence on US policy.' },
    { id: 'tech-war', name: 'Global Tech War', query: 'Developments in the global technology competition, focusing on semiconductors, AI, and regulations between major powers.' },
];

const ViewModeIcon: React.FC<{ mode: ViewMode }> = ({ mode }) => {
    if (mode === 'list') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
    if (mode === 'graph') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>;
    if (mode === 'bookmarks') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>;
    return null;
}

export const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>('en');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [activeTopicId, setActiveTopicId] = useState<string | undefined>();
    const [news, setNews] = useState<Record<string, NewsSection>>({});
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
    
    // States for modals and secondary data
    const [meetings, setMeetings] = useState<{data: UpcomingMeeting[], isLoading: boolean, error: string|null}>({ data: [], isLoading: false, error: null });
    const [isBriefingOpen, setIsBriefingOpen] = useState(false);
    const [briefing, setBriefing] = useState<{data: Briefing|null, isLoading: boolean, error: string|null}>({ data: null, isLoading: false, error: null });
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [timeline, setTimeline] = useState<{events: TimelineEvent[], isLoading: boolean, error: string|null}>({ events: [], isLoading: false, error: null });
    
    // State for Discover More feature
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [moreHeadlinesError, setMoreHeadlinesError] = useState<string | null>(null);

    // State for suggestions in TopicManager
    const [suggestions, setSuggestions] = useState<{related: string[], trending: string[]}>({related: [], trending: []});
    const [suggestionStatus, setSuggestionStatus] = useState({isSuggestingRelated: false, isSuggestingTrending: false});
    
    // State for API fallback, retry logic, and notifications
    const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
    const [isFallbackModalOpen, setIsFallbackModalOpen] = useState<boolean>(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
    const [failedAction, setFailedAction] = useState<FailedAction | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    
    const activeTopic = useMemo(() => topics.find(t => t.id === activeTopicId), [topics, activeTopicId]);
    const activeNewsSection = useMemo(() => activeTopicId ? news[activeTopicId] : undefined, [news, activeTopicId]);
    
    const isAnyTopicLoading = useMemo(() => Object.values(news).some(section => section.isLoading), [news]);

    const isActionInProgress = useMemo(() =>
        isAnyTopicLoading ||
        isLoadingMore ||
        briefing.isLoading ||
        timeline.isLoading ||
        suggestionStatus.isSuggestingRelated ||
        suggestionStatus.isSuggestingTrending ||
        meetings.isLoading,
        [isAnyTopicLoading, isLoadingMore, briefing.isLoading, timeline.isLoading, suggestionStatus, meetings.isLoading]
    );

    const isActionDisabled = !activeNewsSection || activeNewsSection.articles.length === 0 || activeNewsSection.isLoading;
    
    // --- Data Fetching and State Management ---
    
    // Load initial topics, bookmarks and OpenRouter key
    useEffect(() => {
        try {
            const storedTopics = localStorage.getItem('geointel-topics');
            setTopics(storedTopics ? JSON.parse(storedTopics) : initialTopics);

            const storedBookmarks = localStorage.getItem('geointel-bookmarks');
            setBookmarkedArticles(storedBookmarks ? JSON.parse(storedBookmarks) : []);

            const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (envKey) {
                setOpenRouterApiKey(envKey);
            } else {
                const storedOpenRouterKey = localStorage.getItem('geointel-openrouter-key');
                if(storedOpenRouterKey) {
                    setOpenRouterApiKey(storedOpenRouterKey);
                }
            }
        } catch (e) {
            console.error("Failed to load from localStorage", e);
            setTopics(initialTopics);
        }
    }, []);

    // Save topics and bookmarks to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('geointel-topics', JSON.stringify(topics));
        } catch (e) { console.error("Failed to save topics", e); }
    }, [topics]);

    useEffect(() => {
        try {
            localStorage.setItem('geointel-bookmarks', JSON.stringify(bookmarkedArticles));
        } catch (e) { console.error("Failed to save bookmarks", e); }
    }, [bookmarkedArticles]);

    // Generic API call handler with retry and fallback logic
    const handleApiCall = useCallback(async (apiCall: () => Promise<void>, actionType: FailedAction) => {
        try {
            await apiCall();
        } catch (error: any) {
             if (error instanceof apiService.QuotaExceededError) {
                console.warn(error.message);
                setFailedAction(actionType);
                setIsFallbackModalOpen(true);
            } else {
                console.error("A non-quota error occurred:", error);
                const errorMessage = error.message || 'An unexpected error occurred.';
                 setNews(prev => {
                     const activeId = activeTopicId;
                     if(activeId && prev[activeId]) {
                         return { ...prev, [activeId]: {...prev[activeId], isLoading: false, error: errorMessage }};
                     }
                     return prev;
                 });
            }
        }
    }, [activeTopicId]);


    const fetchDataForTopic = useCallback(async (topic: Topic) => {
        const call = async () => {
            setNews(prev => ({ ...prev, [topic.id]: { articles: [], sources: [], entities: [], relationships: [], isLoading: true, isGraphDataLoaded: false, error: null } }));
            const { data, usedFallback } = await apiService.fetchAndAnalyzeTopic(topic.name, topic.query, openRouterApiKey);
            if (usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback key.', type: 'info' });

            const { articles, sources, entities, relationships } = data;
            setNews(prev => ({
                ...prev,
                [topic.id]: {
                    articles,
                    sources,
                    entities,
                    relationships,
                    isLoading: false,
                    isGraphDataLoaded: true,
                    error: null
                }
            }));
        };
        handleApiCall(call, 'FETCH_TOPIC');
    }, [openRouterApiKey, handleApiCall]);

    // Fetch data for active topic when it's selected or added
    useEffect(() => {
        if (activeTopic && !news[activeTopic.id]) {
            fetchDataForTopic(activeTopic);
        }
    }, [activeTopic, news, fetchDataForTopic]);

    const fetchMeetings = useCallback(async () => {
        const call = async () => {
            setMeetings({ data: [], isLoading: true, error: null });
            try {
                const { data: fetchedMeetings, usedFallback } = await apiService.fetchUpcomingMeetings(openRouterApiKey);
                if (usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback key for meetings.', type: 'info' });

                const meetingsWithIds = fetchedMeetings.map((m, i) => ({...m, id: `${m.dateISO}-${i}`})).sort((a,b) => a.dateISO.localeCompare(b.dateISO));
                setMeetings({ data: meetingsWithIds, isLoading: false, error: null });
            } catch (error: any) {
                 if (error instanceof apiService.QuotaExceededError) throw error;
                 setMeetings({ data: [], isLoading: false, error: error.message || 'Failed to fetch meetings.' });
            }
        };
        handleApiCall(call, 'FETCH_MEETINGS');
    }, [openRouterApiKey, handleApiCall]);

    // --- Handlers ---
    
    const handleSelectTopic = useCallback((id: string, forceRefresh = false) => {
        setActiveTopicId(id);
        setSelectedEntity(null);
        const topic = topics.find(t => t.id === id);
        if (topic && (!news[id] || forceRefresh)) {
            fetchDataForTopic(topic);
        }
    }, [topics, news, fetchDataForTopic]);

    const handleRefreshTopic = () => {
        if (activeTopic) {
            fetchDataForTopic(activeTopic);
        }
    };
    
    const handleToggleBookmark = useCallback((articleToToggle: Article) => {
        setBookmarkedArticles(prev => {
            const isAlreadyBookmarked = prev.some(b => b.url === articleToToggle.url);
            if (isAlreadyBookmarked) {
                return prev.filter(b => b.url !== articleToToggle.url);
            } else {
                const bookmarkToAdd: Article = { ...articleToToggle, isBookmarked: true, entities: articleToToggle.entities || [] };
                return [...prev, bookmarkToAdd];
            }
        });
    }, []);

    const handleUpdateTopicQuery = useCallback((id: string, query: string) => {
        setTopics(prevTopics => prevTopics.map(t => (t.id === id ? { ...t, query } : t)));
        handleSelectTopic(id, true);
    }, [handleSelectTopic]);

    const handleAddTopic = (query: string) => {
        const newTopic: Topic = { id: `custom-${Date.now()}`, name: query, query };
        setTopics(prev => [...prev, newTopic]);
        setActiveTopicId(newTopic.id);
    };

    const handleRemoveTopic = (id: string) => {
        setTopics(prev => prev.filter(t => t.id !== id));
        setNews(prev => {
            const newNews = { ...prev };
            delete newNews[id];
            return newNews;
        });
        if (activeTopicId === id) {
            setActiveTopicId(topics.length > 1 ? topics.find(t => t.id !== id)?.id : undefined);
        }
    };

    const handleDiscoverMore = useCallback(async () => {
        if (!activeTopic || !activeNewsSection) return;
        const call = async () => {
            setIsLoadingMore(true);
            setMoreHeadlinesError(null);
            try {
                const { data, usedFallback } = await apiService.discoverAndAnalyzeMore(activeTopic.query, activeNewsSection.articles, openRouterApiKey);
                if (usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback to discover more.', type: 'info' });
                
                const { articles: newArticles, entities: newEntities, relationships: newRelationships } = data;
    
                setNews(prev => {
                    const currentSection = prev[activeTopic.id];
                    if (!currentSection) return prev;
    
                    const existingUrls = new Set(currentSection.articles.map(a => a.url));
                    const newUniqueArticles = newArticles.filter(a => !existingUrls.has(a.url));
    
                    if (newUniqueArticles.length === 0) {
                        setMoreHeadlinesError("No new articles were found at this time.");
                        return prev;
                    }
    
                    const allEntities = [...currentSection.entities, ...(newEntities || [])];
                    const uniqueEntitiesMap = new Map(allEntities.map(e => [e.id, e]));
    
                    const allRelationships = [...currentSection.relationships, ...(newRelationships || [])];
                    const uniqueRelationshipsMap = new Map(allRelationships.map(r => [`${r.source}-${r.target}-${r.label}`, r]));
    
                    return {
                        ...prev,
                        [activeTopic.id]: {
                            ...currentSection,
                            articles: [...currentSection.articles, ...newUniqueArticles],
                            entities: Array.from(uniqueEntitiesMap.values()),
                            relationships: Array.from(uniqueRelationshipsMap.values()),
                        }
                    };
                });
    
            } catch (error: any) {
                if (error instanceof apiService.QuotaExceededError) throw error;
                console.error("Error discovering more headlines:", error);
                setMoreHeadlinesError(error.message || 'Failed to fetch more headlines.');
            } finally {
                setIsLoadingMore(false);
            }
        };
        handleApiCall(call, 'DISCOVER_MORE');
    }, [activeTopic, activeNewsSection, openRouterApiKey, handleApiCall]);

    const handleOpenBriefing = useCallback(async () => {
        if (!activeNewsSection || activeNewsSection.articles.length === 0) {
            setBriefing({ data: null, isLoading: false, error: "Not enough data to generate a briefing. Please select a topic with articles." });
            setIsBriefingOpen(true);
            return;
        }

        const call = async () => {
            setBriefing({ data: null, isLoading: true, error: null });
            setIsBriefingOpen(true);
            try {
                const { data: generatedBriefing, usedFallback } = await apiService.generateDailyBriefing(activeNewsSection.articles, openRouterApiKey);
                if(usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback for briefing.', type: 'info' });
                setBriefing({ data: generatedBriefing, isLoading: false, error: null });
            } catch (error: any) {
                if (error instanceof apiService.QuotaExceededError) throw error;
                console.error("Error generating briefing:", error);
                setBriefing({ data: null, isLoading: false, error: error.message || "Failed to generate briefing." });
            }
        };
        handleApiCall(call, 'GET_BRIEFING');
    }, [activeNewsSection, openRouterApiKey, handleApiCall]);

    const handleOpenTimeline = useCallback(async () => {
        if (!activeNewsSection || activeNewsSection.articles.length === 0) {
            setTimeline({ events: [], isLoading: false, error: "Not enough data for a timeline. Select a topic with articles." });
            setIsTimelineOpen(true);
            return;
        }

        const call = async () => {
            setTimeline({ events: [], isLoading: true, error: null });
            setIsTimelineOpen(true);
            try {
                const { data: events, usedFallback } = await apiService.fetchEventTimeline(activeNewsSection.articles, openRouterApiKey);
                if(usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback for timeline.', type: 'info' });
                setTimeline({ events, isLoading: false, error: null });
            } catch (error: any) {
                if (error instanceof apiService.QuotaExceededError) throw error;
                console.error("Error generating timeline:", error);
                setTimeline({ events: [], isLoading: false, error: error.message || "Failed to generate timeline." });
            }
        };
        handleApiCall(call, 'GET_TIMELINE');
    }, [activeNewsSection, openRouterApiKey, handleApiCall]);

    const handleFetchRelatedSuggestions = useCallback(async () => {
        const call = async () => {
            setSuggestionStatus(prev => ({...prev, isSuggestingRelated: true}));
            try {
                const { data: related, usedFallback } = await apiService.getRelatedTopicSuggestions(topics, openRouterApiKey);
                if(usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback for suggestions.', type: 'info' });
                setSuggestions(prev => ({ ...prev, related: related.filter(s => !topics.some(t => t.name ===s)) }));
            } catch(e: any) {
                if (e instanceof apiService.QuotaExceededError) throw e;
                console.error("Failed to get related suggestions", e);
            } finally {
                setSuggestionStatus(prev => ({...prev, isSuggestingRelated: false}));
            }
        };
        handleApiCall(call, 'FETCH_RELATED_SUGGESTIONS');
    }, [topics, openRouterApiKey, handleApiCall]);

    const handleFetchTrendingSuggestions = useCallback(async () => {
        const call = async () => {
            setSuggestionStatus(prev => ({...prev, isSuggestingTrending: true}));
            try {
                const { data: trending, usedFallback } = await apiService.getTrendingTopicSuggestions(openRouterApiKey);
                if(usedFallback) setToast({ message: 'Google API quota reached. Switched to fallback for suggestions.', type: 'info' });
                setSuggestions(prev => ({ ...prev, trending: trending.filter(s => !topics.some(t => t.name ===s)) }));
            } catch(e: any) {
                if (e instanceof apiService.QuotaExceededError) throw e;
                console.error("Failed to get trending suggestions", e);
            } finally {
                setSuggestionStatus(prev => ({...prev, isSuggestingTrending: false}));
            }
        };
        handleApiCall(call, 'FETCH_TRENDING_SUGGESTIONS');
    }, [topics, openRouterApiKey, handleApiCall]);

    const handleSaveOpenRouterKey = (key: string) => {
        setOpenRouterApiKey(key);
        localStorage.setItem('geointel-openrouter-key', key);
        setIsFallbackModalOpen(false);
    };
    
    useEffect(() => {
        // This effect runs when the modal is closed AND a failed action exists,
        // which is what happens after saving a new key.
        if (!isFallbackModalOpen && failedAction) {
            console.log(`Retrying last failed action: ${failedAction}`);
            const actionToRetry = failedAction;

            // Important: clear the failed action *before* retrying to avoid loops
            setFailedAction(null); 
            
            switch (actionToRetry) {
                case 'FETCH_TOPIC':
                    if (activeTopic) fetchDataForTopic(activeTopic);
                    break;
                case 'DISCOVER_MORE':
                    handleDiscoverMore();
                    break;
                case 'GET_BRIEFING':
                    handleOpenBriefing();
                    break;
                case 'GET_TIMELINE':
                    handleOpenTimeline();
                    break;
                case 'FETCH_MEETINGS':
                    fetchMeetings();
                    break;
                case 'FETCH_RELATED_SUGGESTIONS':
                    handleFetchRelatedSuggestions();
                    break;
                case 'FETCH_TRENDING_SUGGESTIONS':
                    handleFetchTrendingSuggestions();
                    break;
                default:
                    console.error("Unknown action to retry:", actionToRetry);
            }
        }
    }, [isFallbackModalOpen, failedAction, activeTopic, fetchDataForTopic, handleDiscoverMore, handleOpenBriefing, handleOpenTimeline, fetchMeetings, handleFetchRelatedSuggestions, handleFetchTrendingSuggestions]);
    
    const handleSaveSettings = (key: string) => {
        setOpenRouterApiKey(key);
        localStorage.setItem('geointel-openrouter-key', key);
        setIsSettingsModalOpen(false);
        setToast({ message: 'Fallback API key saved successfully.', type: 'success' });
    };

    // --- Render Logic ---

    const renderContent = () => {
        if (activeNewsSection?.isLoading) {
            return <ArticleListSkeleton />;
        }
        if (activeNewsSection?.error) {
            if(isFallbackModalOpen) return <Welcome title="API Quota Limit Reached" message="Please provide a fallback API key in the popup to continue analysis." />;
            return <ErrorMessage message={activeNewsSection.error} />;
        }
        if (!activeTopicId || !activeNewsSection) {
            return <Welcome title="Welcome to the Intelligence Engine" message="Select a topic from the panel above to begin your analysis, or discover what's currently trending in global events." />;
        }
        
        const articlesToShow = viewMode === 'bookmarks' ? bookmarkedArticles : activeNewsSection.articles;

        if (viewMode === 'list' || viewMode === 'bookmarks') {
            return (
                <div className="space-y-6">
                    <ArticleList
                        articles={articlesToShow}
                        language={language}
                        onEntitySelect={setSelectedEntity}
                        onArticleSelect={() => {}}
                        onDiscoverMore={viewMode === 'list' ? handleDiscoverMore : undefined}
                        isLoadingMore={isLoadingMore}
                        moreHeadlinesError={moreHeadlinesError}
                        onToggleBookmark={handleToggleBookmark}
                        bookmarkedArticles={bookmarkedArticles}
                    />
                    {viewMode === 'list' && <SourceList sources={activeNewsSection.sources} />}
                </div>
            );
        }

        if (viewMode === 'graph') {
            if (!activeNewsSection.isGraphDataLoaded) {
                 return <ArticleListSkeleton />;
            }
            return <KnowledgeGraph entities={activeNewsSection.entities} relationships={activeNewsSection.relationships} onNodeClick={setSelectedEntity} selectedEntity={selectedEntity} />;
        }
    };

  if (!import.meta.env.VITE_API_KEY) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-red-500/50 max-w-lg mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="text-2xl font-bold text-red-400 mb-2">Configuration Error</h1>
                <p className="text-gray-300">
                    The Geopolitical Intelligence Engine requires a Google API key to function, but it could not be found.
                </p>
                <p className="mt-4 text-sm text-gray-400 bg-gray-900/50 p-3 rounded-md">
                    Please ensure the <code>VITE_API_KEY</code> environment variable is set correctly in your deployment environment.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans overflow-hidden">
        <Header 
            language={language}
            onLanguageChange={setLanguage}
            isLoading={isActionInProgress}
            onOpenBriefing={handleOpenBriefing}
            onOpenTimeline={handleOpenTimeline}
            isActionDisabled={isActionDisabled}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="container mx-auto p-4 flex-grow flex flex-col overflow-hidden">
            <div className="flex-shrink-0 mb-6">
                <TopicManager 
                    topics={topics}
                    activeTopic={activeTopic}
                    onSelectTopic={handleSelectTopic}
                    onAddTopic={handleAddTopic}
                    onRemoveTopic={handleRemoveTopic}
                    onUpdateTopicQuery={handleUpdateTopicQuery}
                    onFetchRelatedSuggestions={handleFetchRelatedSuggestions}
                    relatedSuggestions={suggestions.related}
                    isSuggestingRelated={suggestionStatus.isSuggestingRelated}
                    onFetchTrendingSuggestions={handleFetchTrendingSuggestions}
                    trendingSuggestions={suggestions.trending}
                    isSuggestingTrending={suggestionStatus.isSuggestingTrending}
                    disabled={isActionInProgress}
                />
            </div>
            
            <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
                <div className="flex-grow h-full overflow-y-auto custom-scrollbar pr-2">
                    {activeTopicId && (
                        <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 z-10">
                            <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg">
                               {(['list', 'graph', 'bookmarks'] as ViewMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        disabled={isActionInProgress || (mode === 'graph' && (!activeNewsSection || !activeNewsSection.isGraphDataLoaded))}
                                        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                            viewMode === mode 
                                            ? 'bg-cyan-600 text-white shadow' 
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <ViewModeIcon mode={mode} />
                                        <span className="capitalize">{mode}</span>
                                    </button>
                               ))}
                            </div>
                            <button
                                onClick={handleRefreshTopic}
                                disabled={isActionInProgress || !activeTopicId}
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                                title="Refresh current topic"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isAnyTopicLoading ? 'animate-spin' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a7.5 7.5 0 0 1-1.066 2.593l-2.256 3.011a15.015 15.015 0 0 1-2.072 2.184l-.662.662a2.25 2.25 0 0 1-3.182 0l-.662-.662a15.015 15.015 0 0 1-2.072-2.184l-2.256-3.011a7.5 7.5 0 0 1-1.066-2.593v-.001h4.992" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {renderContent()}
                </div>

                <aside className="lg:w-[320px] xl:w-[380px] flex-shrink-0 h-full overflow-y-auto custom-scrollbar space-y-6">
                    {selectedEntity ? (
                         <EntityPanel 
                            entity={selectedEntity}
                            articles={activeNewsSection?.articles || []}
                            onClose={() => setSelectedEntity(null)}
                            language={language}
                        />
                    ) : (
                        <MeetingsList 
                            meetings={meetings.data}
                            isLoading={meetings.isLoading}
                            error={meetings.error}
                            onRefresh={fetchMeetings}
                            language={language}
                        />
                    )}
                </aside>
            </div>
        </main>

        <BriefingModal 
            isOpen={isBriefingOpen}
            onClose={() => setIsBriefingOpen(false)}
            briefing={briefing.data}
            isLoading={briefing.isLoading}
            error={briefing.error}
            language={language}
        />
        <TimelineModal
            isOpen={isTimelineOpen}
            onClose={() => setIsTimelineOpen(false)}
            events={timeline.events}
            isLoading={timeline.isLoading}
            error={timeline.error}
        />
        <FallbackApiModal
            isOpen={isFallbackModalOpen}
            onClose={() => setIsFallbackModalOpen(false)}
            onSave={handleSaveOpenRouterKey}
        />
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            currentKey={openRouterApiKey}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
