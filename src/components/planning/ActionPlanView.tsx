import React from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useTracker } from '../../context/TrackerContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { evaluateEligibility } from '../../engine/eligibilityEngine';
import {
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ActionPlanView: React.FC = () => {
  const { profile } = useUserProfile();
  const { userDocuments } = useTracker();

  if (!profile) return null;

  // Find 100% eligible scholarships
  const eligibleScholarships = SCHOLARSHIPS_DATA.filter(
    s => evaluateEligibility(s, profile).status === 'eligible'
  );

  // Missing documents
  const missingDocs = userDocuments.filter(d => d.status === 'not_started');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Personalized Roadmap
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Step-by-Step Scholarship Action Plan
        </h2>
        <p className="text-xs text-slate-500 max-w-xl">
          Prioritized sequence of actions generated dynamically based on your {profile.academic.course} profile, upcoming portal deadlines, and certificate readiness.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Immediate Document Procurement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Urgent Document Acquisition (Next 7–10 Days)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase text-amber-800 px-2 py-0.5 rounded bg-amber-100 border border-amber-200">
              High Priority
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Revenue authority certificates (such as the Tehsildar Income Certificate) require 7–14 days for verification. Start these immediately through your local MeeSeva, CSC, or State e-District portal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {missingDocs.slice(0, 4).map(doc => (
              <div
                key={doc.documentId}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
              >
                <span className="text-slate-800 font-medium">{doc.name}</span>
                <span className="text-[10px] text-amber-700 font-semibold">Needs Application</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: High Value Eligible Applications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Submit High-Match Applications (Next 15–20 Days)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase text-blue-800 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
              Application Window
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Apply online on the official portals for schemes where you meet 100% of the criteria:
          </p>

          <div className="space-y-2">
            {eligibleScholarships.slice(0, 3).map(s => {
              const isOpen = s.deadline.status === 'Open';
              const applyTarget = isOpen && s.source.applicationUrl && s.source.isApplicationUrlVerified
                ? s.source.applicationUrl
                : s.source.officialUrl;
              const buttonText = isOpen ? 'Apply' : 'View Portal';

              return (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-emerald-700 font-mono text-[11px]">
                      Award: {s.awardAmount.formatted} • Portal: {s.source.portalName}
                    </span>
                  </div>
                  <a
                    href={applyTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <span>{buttonText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: College Level Verification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">College Nodal Officer & DBT Verification</h3>
            </div>
            <span className="text-[10px] font-bold uppercase text-purple-800 px-2 py-0.5 rounded bg-purple-100 border border-purple-200">
              Institutional Step
            </span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Submit printed hard copies and original fee receipts to your college scholarship clerk/officer.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Ensure your bank account is Aadhaar seeded on the NPCI mapper for Direct Benefit Transfer (DBT).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Record your Application ID in the My Applications tracker to monitor progress through district approval.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
