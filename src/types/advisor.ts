export interface GroundedCitation {
  scholarshipId: string;
  name: string;
  award: string;
  officialUrl: string;
  relevanceReason: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: GroundedCitation[];
  suggestedFollowUps?: string[];
  isOfflineFallback?: boolean;
}
