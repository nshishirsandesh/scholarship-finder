import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { ApplicationStage, ApplicationTrackerItem } from '../../types/tracker';
import { DeadlineBadge } from '../common/Badge';
import {
  BookmarkCheck,
  FileCheck2,
  Send,
  Search,
  Trophy,
  XCircle,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { Modal } from '../common/Modal';

const STAGES: { id: ApplicationStage; label: string; icon: React.ReactNode; color: string; headerColor: string }[] = [
  { id: 'saved', label: 'Saved', icon: <BookmarkCheck className="w-4 h-4" />, color: 'border-slate-200 bg-slate-50/80', headerColor: 'text-slate-700' },
  { id: 'preparing_documents', label: 'Docs Ready', icon: <FileCheck2 className="w-4 h-4" />, color: 'border-amber-200 bg-amber-50/50', headerColor: 'text-amber-800' },
  { id: 'applied', label: 'Applied', icon: <Send className="w-4 h-4" />, color: 'border-blue-200 bg-blue-50/50', headerColor: 'text-blue-800' },
  { id: 'under_review', label: 'Under Review', icon: <Search className="w-4 h-4" />, color: 'border-purple-200 bg-purple-50/50', headerColor: 'text-purple-800' },
  { id: 'awarded', label: 'Awarded', icon: <Trophy className="w-4 h-4" />, color: 'border-emerald-200 bg-emerald-50/50', headerColor: 'text-emerald-800' },
];

export const TrackerBoard: React.FC = () => {
  const {
    trackerItems,
    updateApplicationStage,
    removeApplication,
    getReadinessPercentageForScholarship,
  } = useTracker();

  const [activeItemForEdit, setActiveItemForEdit] = useState<ApplicationTrackerItem | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAppNo, setEditAppNo] = useState('');

  const openEditModal = (item: ApplicationTrackerItem) => {
    setActiveItemForEdit(item);
    setEditNotes(item.notes || '');
    setEditAppNo(item.applicationNumber || '');
  };

  const handleSaveNotes = () => {
    if (activeItemForEdit) {
      updateApplicationStage(
        activeItemForEdit.scholarshipId,
        activeItemForEdit.stage,
        editNotes,
        editAppNo
      );
      setActiveItemForEdit(null);
    }
  };

  if (trackerItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <BookmarkCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Tracked Applications Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Bookmark scholarships from the Discover tab to organize your application timeline, track official reference numbers, and monitor verification status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Application Pipeline & Tracker</h2>
          <p className="text-xs text-slate-500">
            Track your progress across official portals from certificate preparation to bank disbursement.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
          Total Tracked: <span className="text-emerald-700 font-bold">{trackerItems.length}</span>
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map(stage => {
          const itemsInStage = trackerItems.filter(item => item.stage === stage.id);

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border ${stage.color} p-4 flex flex-col min-h-[420px] space-y-3`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className={`flex items-center gap-1.5 font-bold text-xs ${stage.headerColor}`}>
                  {stage.icon}
                  <span>{stage.label}</span>
                </div>
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold shadow-2xs">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {itemsInStage.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-400 italic">
                    No schemes in {stage.label.toLowerCase()}
                  </div>
                ) : (
                  itemsInStage.map(item => {
                    const scholarship = SCHOLARSHIPS_DATA.find(s => s.id === item.scholarshipId);
                    if (!scholarship) return null;

                    const docScore = getReadinessPercentageForScholarship(scholarship.requiredDocuments);
                    const destinationUrl = scholarship.source.applicationUrl && scholarship.source.isApplicationUrlVerified
                      ? scholarship.source.applicationUrl
                      : scholarship.source.officialUrl;

                    return (
                      <div
                        key={item.scholarshipId}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 space-y-2.5 shadow-2xs transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                            {scholarship.name}
                          </h4>
                          <button
                            onClick={() => removeApplication(item.scholarshipId)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                            title="Remove from tracker"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs font-extrabold text-emerald-700 font-mono">
                          {scholarship.awardAmount.formatted}
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Docs: {docScore.readyCount}/{docScore.totalCount} ({docScore.percentage}%)</span>
                          <DeadlineBadge
                            type={scholarship.deadline.type}
                            closingDate={scholarship.deadline.closingDate}
                            status={scholarship.deadline.status}
                          />
                        </div>

                        {item.applicationNumber && (
                          <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 truncate">
                            ID: {item.applicationNumber}
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            {item.notes}
                          </div>
                        )}

                        {/* Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                          <select
                            value={item.stage}
                            onChange={e => updateApplicationStage(item.scholarshipId, e.target.value as ApplicationStage)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 outline-none max-w-[110px]"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit notes & Application ID"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-700 transition-colors"
                            title="Open official portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Notes & Application ID Modal */}
      {activeItemForEdit && (
        <Modal
          isOpen={Boolean(activeItemForEdit)}
          onClose={() => setActiveItemForEdit(null)}
          title="Update Application Record"
          subtitle="Record official portal registration numbers and submission notes"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Application / OTR Reference Number
              </label>
              <input
                type="text"
                value={editAppNo}
                onChange={e => setEditAppNo(e.target.value)}
                placeholder="e.g. NSP/2026/KA/1004829"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Personal Progress Notes
              </label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="e.g. Submitted bonafide request to Dean office on Nov 4. Scheduled for district nodal verification."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveItemForEdit(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Save Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
