import React from 'react';
import { Modal } from '../common/Modal';
import { useComparison } from '../../context/ComparisonContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { useUserProfile } from '../../context/UserProfileContext';
import { evaluateEligibility } from '../../engine/eligibilityEngine';
import { EligibilityBadge, StatusBadge, DeadlineBadge } from '../common/Badge';
import { ExternalLink, X } from 'lucide-react';

export const ComparisonModal: React.FC = () => {
  const { isComparing, closeComparisonModal, selectedIds, removeFromCompare } = useComparison();
  const { profile } = useUserProfile();

  const scholarships = selectedIds
    .map(id => SCHOLARSHIPS_DATA.find(s => s.id === id))
    .filter(Boolean) as typeof SCHOLARSHIPS_DATA;

  if (!isComparing || scholarships.length === 0) return null;

  return (
    <Modal
      isOpen={isComparing}
      onClose={closeComparisonModal}
      title="Scholarship Side-by-Side Comparison"
      subtitle={`Comparing ${scholarships.length} scholarships across eligibility, financial award, and requirements`}
      maxWidth="5xl"
    >
      <div className="overflow-x-auto pb-4 text-slate-900">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-3 w-44 font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                Attribute
              </th>
              {scholarships.map(s => (
                <th key={s.id} className="p-3 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-sm line-clamp-2 text-slate-900">{s.name}</span>
                    <button
                      onClick={() => removeFromCompare(s.id)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.provider}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Status */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Current Status</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200">
                  <StatusBadge status={s.deadline.status} />
                </td>
              ))}
            </tr>

            {/* Match Status */}
            {profile && (
              <tr>
                <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Your Eligibility</td>
                {scholarships.map(s => {
                  const evalResult = evaluateEligibility(s, profile);
                  return (
                    <td key={s.id} className="p-3 border-l border-slate-200">
                      <EligibilityBadge status={evalResult.status} score={evalResult.matchScore} size="sm" />
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {evalResult.summaryMessage}
                      </div>
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Annual Award Amount */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Annual Funding</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200">
                  <div className="font-extrabold text-sm text-emerald-700 font-mono">
                    {s.awardAmount.formatted}
                  </div>
                  {s.awardAmount.feeWaiverPercentage && (
                    <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                      {s.awardAmount.feeWaiverPercentage}% Tuition Fee Waiver
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Provider Type */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Provider Category</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-700">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium border border-slate-200">
                    {s.providerType}
                  </span>
                </td>
              ))}
            </tr>

            {/* Income Ceiling */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Family Income Limit</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-800 font-medium">
                  {s.criteria.maxAnnualIncome !== undefined
                    ? `≤ ₹${s.criteria.maxAnnualIncome.toLocaleString('en-IN')} / year`
                    : 'No Income Ceiling Specified'}
                </td>
              ))}
            </tr>

            {/* Academic Marks */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Academic Cutoff</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-800">
                  {s.criteria.minPercentage ? `≥ ${s.criteria.minPercentage}% in qualifying exam` : 'Admission in approved course'}
                </td>
              ))}
            </tr>

            {/* Gender Quota */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Gender Criteria</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-700">
                  {s.criteria.eligibleGenders.join(', ')}
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Category / Quota</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-700">
                  {s.criteria.eligibleCategories.includes('ALL')
                    ? 'All Categories (Open Merit/Means)'
                    : s.criteria.eligibleCategories.join(', ')}
                </td>
              ))}
            </tr>

            {/* Domicile State */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">State Domicile</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-700">
                  {s.criteria.eligibleStates.includes('ALL') ? 'All India (Pan-India)' : s.criteria.eligibleStates.join(', ')}
                </td>
              ))}
            </tr>

            {/* Required Documents Count */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Required Documents</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-900">{s.requiredDocuments.length} mandatory documents</span>
                </td>
              ))}
            </tr>

            {/* Deadline */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Deadline & Cycle</td>
              {scholarships.map(s => (
                <td key={s.id} className="p-3 border-l border-slate-200">
                  <DeadlineBadge
                    type={s.deadline.type}
                    closingDate={s.deadline.closingDate}
                    status={s.deadline.status}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">{s.deadline.cycleDescription}</p>
                </td>
              ))}
            </tr>

            {/* Official Links */}
            <tr>
              <td className="p-3 font-semibold text-slate-500 bg-slate-50/50">Official Links</td>
              {scholarships.map(s => {
                const canApply = s.deadline.status === 'Open' && Boolean(s.source.applicationUrl) && s.source.isApplicationUrlVerified;
                return (
                  <td key={s.id} className="p-3 border-l border-slate-200 space-y-1.5">
                    <a
                      href={s.source.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <span>Info Portal</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>

                    {canApply ? (
                      <div>
                        <a
                          href={s.source.applicationUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic">
                        {s.deadline.status === 'Closed' ? 'Closed' : 'Via Info Portal'}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
