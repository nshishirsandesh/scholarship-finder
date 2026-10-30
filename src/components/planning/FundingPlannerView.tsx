import React, { useState } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { calculateFundingPlan } from '../../engine/fundingPlanner';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

export const FundingPlannerView: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();

  const [tuitionInput, setTuitionInput] = useState<number>(
    profile?.aspirations.estimatedAnnualTuitionCost || 75000
  );
  const [livingInput, setLivingInput] = useState<number>(
    profile?.aspirations.estimatedAnnualLivingCost || 50000
  );

  if (!profile) return null;

  const plan = calculateFundingPlan(
    {
      ...profile,
      aspirations: {
        ...profile.aspirations,
        estimatedAnnualTuitionCost: tuitionInput,
        estimatedAnnualLivingCost: livingInput,
      },
    },
    SCHOLARSHIPS_DATA
  );

  const handleSaveCosts = () => {
    updateProfile({
      ...profile,
      aspirations: {
        ...profile.aspirations,
        estimatedAnnualTuitionCost: tuitionInput,
        estimatedAnnualLivingCost: livingInput,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Financial Advisory & Aid Optimization
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Educational Funding Planner & Gap Analysis
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Simulate educational expenses against achievable scholarship funding. The planner incorporates Indian anti-double-dipping regulations so your estimated aid is realistic and achievable.
        </p>

        {/* Expense Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Estimated Annual Tuition Fee (₹)
            </label>
            <input
              type="number"
              step={5000}
              value={tuitionInput}
              onChange={e => setTuitionInput(parseInt(e.target.value, 10) || 0)}
              onBlur={handleSaveCosts}
              className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500">College tuition, lab, exam & library fees</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Estimated Annual Living & Hostel Cost (₹)
            </label>
            <input
              type="number"
              step={5000}
              value={livingInput}
              onChange={e => setLivingInput(parseInt(e.target.value, 10) || 0)}
              onBlur={handleSaveCosts}
              className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500">Accommodation, food, books & equipment</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Annual Expense
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            ₹{plan.totalAnnualExpense.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500">Tuition + Living allowance</p>
        </div>

        {/* Realistic Achievable Aid */}
        <div className="bg-white border-2 border-emerald-500/60 rounded-2xl p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Realistic Expected Aid
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            ₹{plan.realisticExpectedAid.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-800 font-medium">Covers {plan.coveragePercentage}% of total cost</p>
        </div>

        {/* Net Gap */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Net Funding Gap
          </span>
          <div className={`text-2xl font-extrabold font-mono ${plan.netFundingGap === 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
            ₹{plan.netFundingGap.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500">
            {plan.netFundingGap === 0 ? '100% Fully Funded!' : 'Remaining to be bridged'}
          </p>
        </div>

        {/* Max Potential Aid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Aggregated Potential Aid
          </span>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            ₹{plan.potentialTotalAid.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500">Across all 100% matched schemes</p>
        </div>
      </div>

      {/* Realistic Combination Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Government Match */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Primary Government Scheme</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              1 Scheme Allowed
            </span>
          </div>

          {plan.bestGovernmentScholarship ? (
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{plan.bestGovernmentScholarship.name}</h4>
              <div className="text-base font-extrabold text-emerald-700 font-mono">
                ₹{plan.bestGovernmentScholarship.amount.toLocaleString('en-IN')} / year
              </div>
              <p className="text-[11px] text-slate-500">
                Covers tuition fee waiver or government maintenance grant directly into your bank account.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No government scheme currently 100% matched.</p>
          )}
        </div>

        {/* Top CSR / Private Match */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Complementary CSR Foundation</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              Stackable Grant
            </span>
          </div>

          {plan.bestCsrScholarship ? (
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{plan.bestCsrScholarship.name}</h4>
              <div className="text-base font-extrabold text-emerald-700 font-mono">
                ₹{plan.bestCsrScholarship.amount.toLocaleString('en-IN')} / year
              </div>
              <p className="text-[11px] text-slate-500">
                Can typically be combined with government fee concessions to cover hostel, laptops, and living costs.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No CSR foundation currently matched.</p>
          )}
        </div>
      </div>

      {/* Indian Regulatory Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-900">Indian Scholarship Stacking Rules</span>
          <p className="text-slate-600 leading-relaxed">{plan.policyExplanation}</p>
        </div>
      </div>

      {/* Recommendations to Bridge Gap */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
          <span>Strategic Gap Bridging Recommendations</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-700">
          {plan.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
