export type EntityType = 'Person' | 'Organization' | 'Location' | 'Policy' | 'Event' | 'Other';

export interface Entity {
  id: string; // e.g., "joe_biden"
  name: string; // e.g., "Joe Biden"
  type: EntityType;
}

export interface Relationship {
  source: string; // entity id
  target: string; // entity id
  label: string; // e.g., "visited", "criticized", "signed"
}

export interface Article {
  title: string;
  publishedAt: string | null;
  url: string;
  isAnalyzed: boolean;
  summary_en?: string;
  summary_zh?: string;
  entities?: Entity[];
  isBookmarked?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  query: string;
}

export type Language = 'en' | 'zh';

export interface WebSource {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: WebSource;
}

export interface Briefing {
  summary_en: string;
  summary_zh?: string;
}

export interface NewsSection {
  articles: Article[];
  sources: GroundingChunk[];
  entities: Entity[];
  relationships: Relationship[];
  isLoading: boolean;
  isGraphDataLoaded?: boolean;
  error: string | null;
}

export interface TimelineEvent {
    date: string;
    event: string;
}

export interface UpcomingMeeting {
    id: string;
    eventName_en: string;
    eventName_zh?: string;
    participants: string[];
    dateText: string;
    dateISO: string; // For sorting
    location_en: string;
    location_zh?: string;
    focus_en: string;
    focus_zh?: string;
    involvesChina: boolean;
}