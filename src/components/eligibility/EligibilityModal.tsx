import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Scholarship } from '../../types/scholarship';
import { EligibilityResult } from '../../types/eligibility';
import { EligibilityBadge, VerifiedSourceBadge, DeadlineBadge, StatusBadge } from '../common/Badge';
import { INDIAN_DOCUMENTS_TAXONOMY } from '../../data/documentsTaxonomy';
import { useDocumentVault } from '../../context/DocumentVaultContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Lightbulb,
  Building,
  Upload,
  FileCheck2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarship: Scholarship | null;
  eligibility: EligibilityResult | null;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  isOpen,
  onClose,
  scholarship,
  eligibility,
}) => {
  const {
    getDocumentForType,
    uploadDocument,
    checkScholarshipDocumentRequirements,
  } = useDocumentVault();

  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!scholarship || !eligibility) return null;

  const { status } = scholarship.deadline;
  const isDirectApplyAvailable =
    status === 'Open' &&
    Boolean(scholarship.source.applicationUrl) &&
    scholarship.source.isApplicationUrlVerified;

  const docReadiness = checkScholarshipDocumentRequirements(scholarship.requiredDocuments);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadDocId) return;

    const tax = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === activeUploadDocId);
    if (!tax) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      await uploadDocument(file, tax.id, tax.category, tax.name);
      setActiveUploadDocId(null);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. File must be PDF, JPG, or PNG under 10MB.');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Why You Match — Transparent Eligibility Audit"
      subtitle={`Detailed criteria and required document audit for ${scholarship.name}`}
      maxWidth="4xl"
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
      />

      <div className="space-y-6 text-slate-900">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <EligibilityBadge status={eligibility.status} score={eligibility.matchScore} />
            <StatusBadge status={status} />
            <VerifiedSourceBadge
              lastVerifiedDate={scholarship.source.lastVerifiedDate}
              isVerified={scholarship.source.isVerified}
            />
            <DeadlineBadge
              type={scholarship.deadline.type}
              closingDate={scholarship.deadline.closingDate}
              status={status}
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Award Value</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">
              {scholarship.awardAmount.formatted}
            </span>
          </div>
        </div>

        {/* Human Summary Message */}
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed ${
            eligibility.status === 'eligible'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : eligibility.status === 'conditionally_eligible'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span className="font-bold">Audit Summary: </span>
          {eligibility.summaryMessage}
        </div>

        {/* 1. Satisfied Criteria Breakdown */}
        {eligibility.satisfiedRules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Satisfied Requirements ({eligibility.satisfiedRules.length})</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {eligibility.satisfiedRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{rule.name}</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">
                      Requirement: {rule.criterionDescription}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      {rule.userValueDescription}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Failed Criteria Breakdown */}
        {eligibility.failedRules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Unsatisfied Requirements ({eligibility.failedRules.length})</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {eligibility.failedRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-rose-900">{rule.name}</span>
                    <span className="text-[10px] uppercase font-bold text-rose-800 px-1.5 py-0.5 rounded bg-rose-100">
                      Disqualifying Factor
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{rule.failureExplanation}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>Required: {rule.criterionDescription}</span>
                    <span className="text-rose-800 font-semibold">{rule.userValueDescription}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Missing Information Notice */}
        {eligibility.missingInfoRules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Missing Profile Fields ({eligibility.missingInfoRules.length})</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {eligibility.missingInfoRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs"
                >
                  <span className="font-bold text-amber-900 block">{rule.name}</span>
                  <p className="text-slate-700 text-[11px] mt-0.5">{rule.failureExplanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Recommendations & Alternatives */}
        {eligibility.recommendations.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Advisor Recommendations</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              {eligibility.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Required Documents Checklist & Vault Integration */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Document Checklist & Vault Readiness</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload certificates directly to your private browser vault to satisfy scheme requirements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                {docReadiness.uploadedCount} of {docReadiness.totalCount} Ready
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                {docReadiness.percentage}%
              </span>
            </div>
          </div>

          {/* Mini Readiness Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${docReadiness.percentage}%` }}
            />
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {scholarship.requiredDocuments.map(docId => {
              const item = INDIAN_DOCUMENTS_TAXONOMY.find(t => t.id === docId);
              const uploadedDoc = getDocumentForType(docId);

              return (
                <div
                  key={docId}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 transition-all ${
                    uploadedDoc
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">
                        {item ? item.name : docId}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Authority: {item?.issuingAuthority || 'Authorized official'}
                      </span>
                    </div>

                    {uploadedDoc ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Uploaded</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 shrink-0">
                        Missing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    {item && item.approxDaysToProcure > 0 ? (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>~{item.approxDaysToProcure} days to procure</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Available immediately</span>
                    )}

                    {uploadedDoc ? (
                      <span className="text-emerald-700 font-semibold truncate max-w-[130px]">
                        {uploadedDoc.fileName}
                      </span>
                    ) : (
                      <button
                        onClick={() => triggerUpload(docId)}
                        disabled={isUploading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Source & Application Action Footer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>{scholarship.source.portalName}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Authority: {scholarship.source.issuingAuthority} • Last verified: {scholarship.source.lastVerifiedDate}
            </p>
            {scholarship.source.notes && (
              <p className="text-[11px] text-slate-600 italic mt-0.5">{scholarship.source.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Official Portal / Guidelines */}
            <a
              href={scholarship.source.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Official Info Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            {/* Direct Apply or Status Action */}
            {isDirectApplyAvailable ? (
              <a
                href={scholarship.source.applicationUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-slate-200 text-slate-600 text-xs font-medium">
                {status === 'Closed'
                  ? 'Applications Closed'
                  : status === 'Upcoming'
                  ? 'Application Cycle Upcoming'
                  : 'Check Portal for Cycle Updates'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
