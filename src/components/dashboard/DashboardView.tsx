import React, { useState } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useTracker } from '../../context/TrackerContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { evaluateEligibility } from '../../engine/eligibilityEngine';
import { detectMissingProfileGaps } from '../../engine/gapDetector';
import { ScholarshipCard } from '../search/ScholarshipCard';
import { Scholarship } from '../../types/scholarship';
import { EligibilityResult } from '../../types/eligibility';
import {
  Trophy,
  AlertTriangle,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  SlidersHorizontal,
  BookmarkCheck,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../../types/navigation';

interface DashboardViewProps {
  onOpenAudit: (scholarship: Scholarship, eligibility: EligibilityResult) => void;
  setActiveTab: (tab: ActiveTab) => void;
  openAdvisor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAudit,
  setActiveTab,
  openAdvisor,
}) => {
  const { profile, lastUpdateImpact, clearUpdateImpact } = useUserProfile();
  const { trackerItems, isReminderActive } = useTracker();
  const [heroSearchInput, setHeroSearchInput] = useState('');

  if (!profile) return null;

  // Evaluate all scholarships for active profile
  const evaluations = SCHOLARSHIPS_DATA.map(s => ({
    scholarship: s,
    eligibility: evaluateEligibility(s, profile),
  })).sort((a, b) => b.eligibility.matchScore - a.eligibility.matchScore);

  const eligibleItems = evaluations.filter(e => e.eligibility.status === 'eligible');
  const potentialTotalFunding = eligibleItems.reduce(
    (sum, e) => sum + e.scholarship.awardAmount.maxAmountPerYear,
    0
  );

  // Closing soon count based on reference date October 29, 2026
  const today = new Date('2026-10-29T21:59:00+05:30');
  const closingSoonItems = SCHOLARSHIPS_DATA.filter(s => {
    if (!s.deadline.closingDate || s.deadline.status === 'Closed') return false;
    const diff = Math.ceil((new Date(s.deadline.closingDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  // Urgent closing in 15 days
  const urgentItems = closingSoonItems.filter(s => {
    const diff = Math.ceil((new Date(s.deadline.closingDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 15;
  });

  // Missing profile gaps
  const profileGaps = detectMissingProfileGaps(profile, SCHOLARSHIPS_DATA);

  // Profile completeness score
  let filledPoints = 5;
  if (profile.academic.class12Percentage) filledPoints += 1;
  if (profile.academic.currentPercentageOrCgpa) filledPoints += 1;
  if (profile.location.state) filledPoints += 1;
  if (profile.location.district) filledPoints += 1;
  if (profile.financialAndCategory.annualFamilyIncome) filledPoints += 1;
  const completenessPct = Math.min(100, Math.round((filledPoints / 10) * 100));

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('discover');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-8">
      {/* Profile Update Result Impact Banner */}
      {lastUpdateImpact && lastUpdateImpact.hasPositiveImpact && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 animate-scaleUp text-slate-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="w-5 h-5 animate-pulse text-emerald-600" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xs block">
                Profile Matching Updated
              </span>
              <p className="text-xs text-emerald-800 mt-0.5">
                {lastUpdateImpact.summaryMessage}
              </p>
            </div>
          </div>
          <button
            onClick={clearUpdateImpact}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome & Search Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-midnight-950 via-midnight-900 to-slate-900 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-lg text-white">
        {/* Background decorative glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Active Profile Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Verified Profile Active
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {profile.academic.course || profile.academic.level} • {profile.location.state || 'India'}
            </span>
            {profile.financialAndCategory.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {profile.financialAndCategory.category}
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <span className="text-emerald-400">{profile.fullName}</span>
          </h1>

          {/* Subtitle / Stat */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Evaluated against <span className="font-bold text-white font-mono">{SCHOLARSHIPS_DATA.length} verified Indian scholarships</span>. You qualify for up to{' '}
            <span className="font-extrabold text-emerald-400 font-mono text-sm sm:text-base">
              ₹{potentialTotalFunding.toLocaleString('en-IN')}/year
            </span>{' '}
            in achievable higher education grants.
          </p>

          {/* Embedded Quick Search Form */}
          <form onSubmit={handleHeroSearchSubmit} className="pt-2 max-w-xl">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-md shadow-inner">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={heroSearchInput}
                onChange={e => setHeroSearchInput(e.target.value)}
                placeholder="Search by degree, category, or state (e.g. B.Tech in Karnataka)..."
                className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex-shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick-Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-400">Quick Filters:</span>
            {[
              'Engineering for Girls',
              'Income ≤ 2.5 LPA',
              'Telangana ePASS',
              'Karnataka SSP',
              'Top Class SC/ST',
            ].map(chip => (
              <button
                key={chip}
                onClick={() => setActiveTab('discover')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Signature KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: 100% Eligible (Electric Blue) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs hover:border-blue-300 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Eligible Matches
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">
            {eligibleItems.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">100% criteria satisfied</p>
        </div>

        {/* Metric 2: Potential Funding (Emerald / Teal) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Potential Aid
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono truncate">
            ₹{potentialTotalFunding.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Total annual grant potential</p>
        </div>

        {/* Metric 3: Upcoming Deadlines (Amber / Gold) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs hover:border-amber-300 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Closing Soon
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
            {closingSoonItems.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Within next 30 days</p>
        </div>

        {/* Metric 4: Profile Readiness (Lavender / Violet) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-1 shadow-xs hover:border-violet-300 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profile Score
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-violet-700 font-mono">
            {completenessPct}%
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {profileGaps.length === 0 ? 'Optimal matching' : `${profileGaps.length} gaps to unlock`}
          </p>
        </div>
      </div>

      {/* Next Actions & Urgent Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Urgent Deadlines Alert */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Approaching Deadlines (Next 15 Days)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentItems.length > 0 ? (
            <div className="space-y-2 pt-1">
              {urgentItems.slice(0, 3).map(s => {
                const diff = Math.ceil((new Date(s.deadline.closingDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-bold text-slate-900 truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{s.provider}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                        {diff === 0 ? 'Closes today' : `${diff} days left`}
                      </span>
                      <a
                        href={s.source.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-[11px]"
                      >
                        Portal
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No imminent deadlines expiring in the next 15 days. Check calendar for November and December windows.
            </p>
          )}
        </div>

        {/* Profile Gap Resolver */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-violet-800 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-violet-600" />
              <span>Smart Recommendation</span>
            </div>
            {profileGaps.length > 0 ? (
              <>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {profileGaps[0].description} Updating this field can unlock matching for{' '}
                  <span className="font-bold text-slate-900 font-mono">
                    {profileGaps[0].potentialUnlockCount} more scholarships
                  </span>.
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs font-bold text-violet-700 hover:text-violet-800 inline-flex items-center gap-1 pt-1"
                >
                  <span>{profileGaps[0].actionStep}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Your profile is 100% complete! All academic, category, and domicile fields are actively evaluated.
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-violet-50/80 border border-violet-200 text-xs text-violet-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>AI Advisor Assistance</span>
            </div>
            <p className="text-[11px] text-violet-700 leading-snug">
              Need personalized application strategy? Ask questions grounded in your real profile.
            </p>
            <button
              onClick={openAdvisor}
              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Start AI Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Top Recommended Scholarships Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Top Ranked Scholarship Matches
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic matching calculated against your academic and financial criteria
            </p>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <span>View All ({SCHOLARSHIPS_DATA.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.slice(0, 6).map(({ scholarship, eligibility }) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              eligibility={eligibility}
              onOpenAudit={onOpenAudit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
