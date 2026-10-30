import React, { useState, useRef } from 'react';
import { useDocumentVault } from '../../context/DocumentVaultContext';
import { INDIAN_DOCUMENTS_TAXONOMY } from '../../data/documentsTaxonomy';
import { DocumentCategory, VaultDocument } from '../../types/documentVault';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import {
  Building,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  FileCheck2,
  HardDrive,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DocumentChecklist: React.FC = () => {
  const {
    documents,
    uploadDocument,
    removeDocument,
    downloadDocument,
    getDocumentForType,
    getScholarshipsUsingDocument,
  } = useDocumentVault();

  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const categories: DocumentCategory[] = ['Identity', 'Academic', 'Income & Social', 'Institutional'];

  // Overall readiness
  const totalTaxonomyDocs = INDIAN_DOCUMENTS_TAXONOMY.length;
  const uploadedCount = documents.length;
  const readinessPct = totalTaxonomyDocs > 0 ? Math.min(100, Math.round((uploadedCount / totalTaxonomyDocs) * 100)) : 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string, category: DocumentCategory, displayName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      await uploadDocument(file, docType, category, displayName);
      setActiveUploadDocId(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document. Ensure file is PDF, PNG, or JPG under 10MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (docId: string) => {
    setUploadError(null);
    setActiveUploadDocId(docId);
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={e => {
          if (!activeUploadDocId) return;
          const tax = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === activeUploadDocId);
          if (tax) {
            handleFileSelect(e, tax.id, tax.category, tax.name);
          }
        }}
      />

      {/* Top Header & Readiness Meter */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Application Readiness Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>IndexedDB Client Vault</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Smart Document Checklist & Vault
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Upload verified PDF or image certificates (up to 10MB). Documents are stored locally in your browser's private vault to evaluate real-time application readiness across all {SCHOLARSHIPS_DATA.length} verified scholarships.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center min-w-[170px] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Vault Readiness
            </span>
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">
              {readinessPct}%
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
              {uploadedCount} Certificates Uploaded
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${readinessPct}%` }}
          />
        </div>

        {/* Privacy & Storage Disclosure Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <HardDrive className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-slate-900">Local Browser Storage Notice: </span>
            <span>
              Files are stored locally in your browser's private IndexedDB database (<code className="px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-800 text-[11px]">ScholarshipFinderVaultDB</code>).
              No documents are transmitted to external servers. Clearing browser data or using incognito will reset local storage.
            </span>
          </div>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Categorized Document Sections */}
      <div className="space-y-6">
        {categories.map(cat => {
          const docsInCat = INDIAN_DOCUMENTS_TAXONOMY.filter(d => d.category === cat);
          if (docsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{cat} Documents</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {docsInCat.map(taxItem => {
                  const uploadedDoc = getDocumentForType(taxItem.id);
                  const relatedScholarships = getScholarshipsUsingDocument(taxItem.id);

                  return (
                    <div
                      key={taxItem.id}
                      className={`bg-white border rounded-2xl p-4 space-y-3 transition-all shadow-2xs ${
                        uploadedDoc ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{taxItem.name}</h4>
                            {uploadedDoc ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Uploaded</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                Missing
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{taxItem.issuingAuthority}</span>
                          </div>
                        </div>

                        {taxItem.approxDaysToProcure > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 shrink-0 font-medium border border-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>~{taxItem.approxDaysToProcure}d</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {taxItem.description}
                      </p>

                      {/* Associated Verified Schemes */}
                      {relatedScholarships.length > 0 && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-0.5">
                          <span className="font-semibold text-slate-700 block">Required by verified schemes:</span>
                          <span className="line-clamp-1 text-slate-600">
                            {relatedScholarships.slice(0, 3).map(s => s.name).join(', ')}
                            {relatedScholarships.length > 3 && ` +${relatedScholarships.length - 3} more`}
                          </span>
                        </div>
                      )}

                      {/* File Details if Uploaded */}
                      {uploadedDoc && (
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">{uploadedDoc.fileName}</span>
                              <span className="text-[10px] text-slate-500">
                                {formatFileSize(uploadedDoc.fileSize)} • Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => downloadDocument(uploadedDoc)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download certificate"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmDocId(uploadedDoc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete from vault"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Delete Confirmation Box */}
                      {deleteConfirmDocId === uploadedDoc?.id && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between gap-2">
                          <span className="text-rose-900 font-medium">Remove this document?</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDeleteConfirmDocId(null)}
                              className="px-2 py-1 rounded bg-white text-slate-700 border border-slate-200 text-[11px] font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await removeDocument(uploadedDoc.id);
                                setDeleteConfirmDocId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          {uploadedDoc ? (
                            <button
                              onClick={() => triggerUpload(taxItem.id)}
                              disabled={isUploading}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-500" />
                              <span>Replace File</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerUpload(taxItem.id)}
                              disabled={isUploading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Document</span>
                            </button>
                          )}
                        </div>

                        {taxItem.officialHowToUrl && (
                          <a
                            href={taxItem.officialHowToUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 font-medium p-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <span>Official Guidelines</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
