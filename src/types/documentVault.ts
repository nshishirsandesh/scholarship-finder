export type DocumentCategory =
  | 'Identity'
  | 'Academic'
  | 'Income & Social'
  | 'Institutional'
  | 'Other';

export type DocumentLifecycleStatus = 'Uploaded' | 'Needs review' | 'Expired';

export type ScholarshipDocumentStatus =
  | 'Uploaded'
  | 'Missing'
  | 'Needs review'
  | 'Expired'
  | 'Not required';

export interface VaultDocument {
  id: string;
  userId: string;
  documentType: string; // e.g. 'income_cert', 'marksheet_12', 'bonafide_cert', etc.
  category: DocumentCategory;
  name: string; // Display name e.g. "Income Certificate (Tehsildar)"
  fileName: string;
  fileSize: number; // In bytes
  mimeType: string;
  uploadedAt: string; // ISO string
  academicYear?: string; // e.g. "2026-27"
  expiryDate?: string; // ISO string (e.g. income certs expire annually on March 31)
  issuingAuthority?: string;
  status: DocumentLifecycleStatus;
  storageMode: 'local_prototype' | 'firebase_storage';
  notes?: string;
}

export interface DocumentVerificationCheck {
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  issuingAuthority: string;
  approxDaysToProcure: number;
  officialHowToUrl?: string;
  isOfficiallyMandatory: boolean; // Confirmed mandatory vs general recommendation
  status: ScholarshipDocumentStatus;
  uploadedDoc?: VaultDocument;
  statusReason: string;
}
