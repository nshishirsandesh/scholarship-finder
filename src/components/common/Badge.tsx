import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { OverallEligibility } from '../../types/eligibility';
import { ApplicationStatus } from '../../types/scholarship';

interface EligibilityBadgeProps {
  status: OverallEligibility;
  score?: number;
  size?: 'sm' | 'md';
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  status,
  score,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (status === 'eligible') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding}`}
      >
        <CheckCircle2 className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-600`} />
        <span>100% Eligible</span>
        {score !== undefined && <span className="text-emerald-700 font-bold">({score}%)</span>}
      </span>
    );
  }

  if (status === 'conditionally_eligible') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${padding}`}
      >
        <AlertTriangle className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-600`} />
        <span>Action / Review</span>
        {score !== undefined && <span className="text-amber-700 font-bold">({score}%)</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${padding}`}
    >
      <XCircle className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-600`} />
      <span>Not Eligible</span>
      {score !== undefined && <span className="text-rose-700 font-bold">({score}%)</span>}
    </span>
  );
};

export const VerifiedSourceBadge: React.FC<{
  lastVerifiedDate: string;
  isVerified?: boolean;
}> = ({ lastVerifiedDate, isVerified = true }) => {
  if (!isVerified) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300"
        title="Unconfirmed official portal. Direct verification in progress."
      >
        <AlertCircle className="w-3 h-3 text-slate-500" />
        <span>Unconfirmed Source</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200"
      title={`Information verified against official gazette / portal in ${lastVerifiedDate}`}
    >
      <ShieldCheck className="w-3 h-3 text-blue-600" />
      <span>Verified Official</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Open</span>
        </span>
      );
    case 'Upcoming':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Upcoming</span>
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
          <span>Closed</span>
        </span>
      );
    case 'Unconfirmed':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200">
          <AlertCircle className="w-3 h-3 text-purple-600" />
          <span>Unconfirmed</span>
        </span>
      );
  }
};

export const DeadlineBadge: React.FC<{
  type: 'fixed' | 'tentative' | 'rolling';
  closingDate?: string;
  status?: ApplicationStatus;
}> = ({ type, closingDate, status }) => {
  if (status === 'Closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Cycle Closed</span>
      </span>
    );
  }

  if (status === 'Unconfirmed' || type === 'tentative' || !closingDate) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>Annual Window</span>
      </span>
    );
  }

  // Current reference date: October 29, 2026
  const today = new Date('2026-10-29T21:59:00+05:30');
  const deadline = new Date(closingDate);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-300">
        <Clock className="w-3 h-3" />
        <span>Closed for Cycle</span>
      </span>
    );
  }

  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
        <Clock className="w-3 h-3 text-rose-600" />
        <span>{diffDays === 0 ? 'Closing Today!' : `${diffDays} days left`}</span>
      </span>
    );
  }

  if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>{diffDays} days left</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <Clock className="w-3 h-3 text-emerald-600" />
      <span>Closes {new Date(closingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
    </span>
  );
};
