import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VaultDocument, DocumentCategory, DocumentVerificationCheck, ScholarshipDocumentStatus } from '../types/documentVault';
import { useAuth } from './AuthContext';
import {
  loadUserVaultDocuments,
  saveVaultDocumentFile,
  deleteVaultDocument,
  downloadVaultDocument,
  getVaultDocumentBlob,
} from '../services/vaultStorageService';
import { INDIAN_DOCUMENTS_TAXONOMY } from '../data/documentsTaxonomy';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';

interface DocumentVaultContextType {
  documents: VaultDocument[];
  isLoading: boolean;
  uploadDocument: (
    file: File,
    documentType: string,
    category: DocumentCategory,
    displayName?: string,
    extra?: { academicYear?: string; expiryDate?: string; notes?: string }
  ) => Promise<VaultDocument>;
  removeDocument: (docId: string) => Promise<void>;
  downloadDocument: (doc: VaultDocument) => Promise<void>;
  previewDocument: (docId: string) => Promise<string | null>; // Returns temporary object URL
  getDocumentForType: (documentType: string) => VaultDocument | undefined;
  checkScholarshipDocumentRequirements: (requiredDocIds: string[]) => {
    checks: DocumentVerificationCheck[];
    uploadedCount: number;
    totalCount: number;
    percentage: number;
  };
  getScholarshipsUsingDocument: (documentType: string) => { id: string; name: string }[];
  refreshDocuments: () => Promise<void>;
}

const DocumentVaultContext = createContext<DocumentVaultContextType | undefined>(undefined);

export const DocumentVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUserId } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    if (!activeUserId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const docs = await loadUserVaultDocuments(activeUserId);
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load user vault documents:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = async (
    file: File,
    documentType: string,
    category: DocumentCategory,
    displayName?: string,
    extra?: { academicYear?: string; expiryDate?: string; notes?: string }
  ): Promise<VaultDocument> => {
    const taxItem = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === documentType);
    const finalName = displayName || taxItem?.name || documentType;
    const finalCategory = category || taxItem?.category || 'Other';

    const savedDoc = await saveVaultDocumentFile(
      activeUserId,
      file,
      documentType,
      finalCategory,
      finalName,
      extra
    );

    // Update state immediately
    setDocuments(prev => [savedDoc, ...prev.filter(d => d.id !== savedDoc.id)]);
    return savedDoc;
  };

  const removeDocument = async (docId: string) => {
    await deleteVaultDocument(activeUserId, docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const downloadDocument = async (doc: VaultDocument) => {
    await downloadVaultDocument(doc);
  };

  const previewDocument = async (docId: string): Promise<string | null> => {
    const blob = await getVaultDocumentBlob(docId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  };

  const getDocumentForType = useCallback(
    (documentType: string): VaultDocument | undefined => {
      // Return latest uploaded document matching documentType
      return documents.find(d => d.documentType === documentType);
    },
    [documents]
  );

  const checkScholarshipDocumentRequirements = useCallback(
    (requiredDocIds: string[]) => {
      const now = new Date();
      let uploadedCount = 0;

      const checks: DocumentVerificationCheck[] = requiredDocIds.map(docId => {
        const taxItem = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === docId);
        const uploadedDoc = documents.find(d => d.documentType === docId);

        let status: ScholarshipDocumentStatus = 'Missing';
        let statusReason = 'Document not yet uploaded in your vault.';

        if (uploadedDoc) {
          if (uploadedDoc.expiryDate) {
            const exp = new Date(uploadedDoc.expiryDate);
            if (exp.getTime() < now.getTime()) {
              status = 'Expired';
              statusReason = `Certificate expired on ${exp.toLocaleDateString('en-IN')}. A renewed certificate is required.`;
            } else {
              status = 'Uploaded';
              statusReason = `Uploaded (${uploadedDoc.fileName}). Valid until ${exp.toLocaleDateString('en-IN')}.`;
              uploadedCount++;
            }
          } else {
            status = 'Uploaded';
            statusReason = `Uploaded (${uploadedDoc.fileName}). Ready for application attachment.`;
            uploadedCount++;
          }
        }

        return {
          documentId: docId,
          documentName: taxItem?.name || docId,
          category: taxItem?.category || 'Other',
          issuingAuthority: taxItem?.issuingAuthority || 'Competent Government Authority',
          approxDaysToProcure: taxItem?.approxDaysToProcure || 7,
          officialHowToUrl: taxItem?.officialHowToUrl,
          isOfficiallyMandatory: true,
          status,
          uploadedDoc,
          statusReason,
        };
      });

      const totalCount = requiredDocIds.length;
      const percentage = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 100;

      return {
        checks,
        uploadedCount,
        totalCount,
        percentage,
      };
    },
    [documents]
  );

  const getScholarshipsUsingDocument = useCallback(
    (documentType: string) => {
      return SCHOLARSHIPS_DATA.filter(s => s.requiredDocuments.includes(documentType)).map(s => ({
        id: s.id,
        name: s.name,
      }));
    },
    []
  );

  return (
    <DocumentVaultContext.Provider
      value={{
        documents,
        isLoading,
        uploadDocument,
        removeDocument,
        downloadDocument,
        previewDocument,
        getDocumentForType,
        checkScholarshipDocumentRequirements,
        getScholarshipsUsingDocument,
        refreshDocuments: loadDocuments,
      }}
    >
      {children}
    </DocumentVaultContext.Provider>
  );
};

export function useDocumentVault() {
  const context = useContext(DocumentVaultContext);
  if (!context) {
    throw new Error('useDocumentVault must be used within a DocumentVaultProvider');
  }
  return context;
}
