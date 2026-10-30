export type ApplicationStage =
  | 'saved'
  | 'preparing_documents'
  | 'applied'
  | 'under_review'
  | 'awarded'
  | 'rejected';

export type DocumentReadiness = 'ready' | 'in_progress' | 'not_started';

export interface UserDocumentStatus {
  documentId: string;
  name: string;
  status: DocumentReadiness;
  issuingAuthority: string;
  notes?: string;
  updatedAt: string;
}

export interface ApplicationTrackerItem {
  scholarshipId: string;
  stage: ApplicationStage;
  savedAt: string;
  appliedDate?: string;
  applicationNumber?: string;
  notes?: string;
  reminderEnabled?: boolean;
  reminderDate?: string;
  awardReceivedAmount?: number;
}

export interface DocumentTaxonomyItem {
  id: string;
  name: string;
  category: 'Identity' | 'Academic' | 'Income & Social' | 'Institutional';
  description: string;
  issuingAuthority: string;
  approxDaysToProcure: number;
  officialHowToUrl?: string;
}
