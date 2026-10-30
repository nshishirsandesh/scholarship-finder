import React from 'react';
import { Scholarship } from '../../types/scholarship';
import { EligibilityResult } from '../../types/eligibility';
import { EligibilityBadge, VerifiedSourceBadge, DeadlineBadge, StatusBadge } from '../common/Badge';
import { useTracker } from '../../context/TrackerContext';
import { useComparison } from '../../context/ComparisonContext';
import {
  Bookmark,
  ExternalLink,
  Info,
  Scale,
  FileCheck,
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  eligibility: EligibilityResult;
  onOpenAudit: (scholarship: Scholarship, eligibility: EligibilityResult) => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  eligibility,
  onOpenAudit,
}) => {
  const { isSaved, toggleSaveScholarship, getReadinessPercentageForScholarship } = useTracker();
  const { isCompared, toggleCompare } = useComparison();

  const saved = isSaved(scholarship.id);
  const compared = isCompared(scholarship.id);
  const docReadiness = getReadinessPercentageForScholarship(scholarship.requiredDocuments);

  const { status } = scholarship.deadline;
  const isDirectApplyAvailable =
    status === 'Open' &&
    Boolean(scholarship.source.applicationUrl) &&
    scholarship.source.isApplicationUrlVerified;

  // Provider category styling
  const providerTheme = {
    'Central Government': 'bg-blue-50 text-blue-700 border-blue-200',
    'State Government': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Corporate CSR': 'bg-purple-50 text-purple-700 border-purple-200',
    'Private Foundation': 'bg-amber-50 text-amber-700 border-amber-200',
    'Trust / NGO': 'bg-slate-100 text-slate-700 border-slate-200',
  }[scholarship.providerType] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group relative overflow-hidden">
      {/* Top Emerald/Gold Edge Accent for high-match scholarships */}
      {eligibility.status === 'eligible' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-electric-500" />
      )}

      <div>
        {/* Top Badges Rail */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <EligibilityBadge status={eligibility.status} score={eligibility.matchScore} size="sm" />
            <StatusBadge status={status} />
            <DeadlineBadge
              type={scholarship.deadline.type}
              closingDate={scholarship.deadline.closingDate}
              status={status}
            />
          </div>

          <div className="flex items-center gap-1">
            {/* Compare Toggle */}
            <button
              onClick={() => toggleCompare(scholarship.id)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                compared
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Add to comparison matrix (up to 4)"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">{compared ? 'Compared' : 'Compare'}</span>
            </button>

            {/* Bookmark / Save */}
            <button
              onClick={() => toggleSaveScholarship(scholarship.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                saved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
              }`}
              title={saved ? 'Remove from Saved' : 'Save Scholarship'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scheme Title & Provider */}
        <div className="mb-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${providerTheme}`}
            >
              {scholarship.providerType}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {scholarship.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{scholarship.provider}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
          {scholarship.shortDescription}
        </p>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-100 mb-3.5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Annual Award
            </span>
            <span className="font-extrabold text-emerald-700 font-mono text-sm">
              {scholarship.awardAmount.formatted}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Doc Readiness
            </span>
            <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {docReadiness.readyCount}/{docReadiness.totalCount} ({docReadiness.percentage}%)
              </span>
            </span>
          </div>
        </div>

        {/* Tags & Official Source Badge */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <VerifiedSourceBadge
            lastVerifiedDate={scholarship.source.lastVerifiedDate}
            isVerified={scholarship.source.isVerified}
          />
          {scholarship.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer with Differentiated Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => onOpenAudit(scholarship, eligibility)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors py-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Why You Match</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Official Info Page */}
          <a
            href={scholarship.source.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="Open official scholarship information & guidelines page"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Apply Now or Status Button */}
          {isDirectApplyAvailable ? (
            <a
              href={scholarship.source.applicationUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
              title="Open verified official online application page"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3 h-3 text-white" />
            </a>
          ) : status === 'Closed' ? (
            <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed">
              Applications Closed
            </span>
          ) : status === 'Upcoming' ? (
            <a
              href={scholarship.source.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors"
            >
              <span>Upcoming</span>
            </a>
          ) : (
            <a
              href={scholarship.source.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold transition-colors"
              title="Direct application unconfirmed; view official portal"
            >
              <span>View Portal</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
