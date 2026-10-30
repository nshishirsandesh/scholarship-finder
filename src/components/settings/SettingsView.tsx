import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  HardDrive,
  KeyRound,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useDocumentVault } from '../../context/DocumentVaultContext';
import { useToast } from '../common/Toast';
import { exportUserDataAsJson, wipeAllUserData } from '../../services/storageService';

export const SettingsView: React.FC = () => {
  const { profile, resetProfile } = useUserProfile();
  const { isAuthenticated, activeUserId, logout } = useAuth();
  const { documents, removeDocument } = useDocumentVault();
  const { showToast } = useToast();

  const [isWiping, setIsWiping] = useState(false);
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);

  const targetUserId = profile?.uid || activeUserId || 'guest_user';

  const handleExportBackup = () => {
    if (!profile) {
      showToast('No active student profile to export.', 'info');
      return;
    }
    const jsonStr = exportUserDataAsJson(targetUserId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarship_finder_backup_${targetUserId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Student profile backup downloaded successfully!', 'success');
  };

  const handleExecuteWipe = async () => {
    setIsWiping(true);
    try {
      // Clear IndexedDB vault documents
      for (const doc of documents) {
        await removeDocument(doc.id);
      }
      // Wipe localStorage
      await wipeAllUserData(targetUserId);
      // Reset active context
      resetProfile();
      await logout();
      showToast('All local student data and documents wiped completely.', 'info');
    } catch (err) {
      showToast('Encountered an issue wiping data.', 'error');
    } finally {
      setIsWiping(false);
      setShowConfirmWipe(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Settings Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border border-slate-200">
            Account & System Controls
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Local Data Privacy
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Scholarship Finder operates on a privacy-first, zero-centralized-tracking architecture. Your academic credentials, income declarations, and uploaded certificates are stored strictly inside your browser.
        </p>
      </div>

      {/* Storage Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Local IndexedDB Vault */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Vault Storage
              </h3>
              <p className="text-[11px] text-slate-500">IndexedDB Client-Side Database</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All certificates and grade sheets are encrypted as binary Blobs in your browser’s <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">ScholarshipFinderVaultDB</code>. No files ever leave your machine without your explicit submission.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Documents stored:</span>
            <span className="font-bold text-emerald-700">{documents.length} files</span>
          </div>
        </div>

        {/* Card 2: Profile Storage */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Deterministic Eligibility Engine
              </h3>
              <p className="text-[11px] text-slate-500">Browser-Side Matching Algorithm</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eligibility evaluations for all 204 scholarships are computed entirely on-device via strict deterministic logic. No marketing profiling or external ad-tracking is performed.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Active Student ID:</span>
            <span className="font-mono font-medium text-slate-800 text-[11px]">
              {profile?.uid || activeUserId || 'guest_user'}
            </span>
          </div>
        </div>
      </div>

      {/* Backup & Portability */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Data Portability & Backup</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Download an offline structured JSON file containing your active profile details, academic credentials, and tracking history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Student Profile Backup (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Data Wipe */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Danger Zone</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">Wipe All Local Storage</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Permanently delete your student profile, saved scholarships, application tracker history, and all stored documents from this computer. This action cannot be reversed.
          </p>
        </div>

        {showConfirmWipe ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-3">
            <p className="text-xs font-bold text-rose-900">
              Are you sure? All 204 scholarship match records and uploaded documents in your Document Vault will be permanently purged.
            </p>
            <div className="flex items-center gap-3">
              <button
                disabled={isWiping}
                onClick={handleExecuteWipe}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
              >
                {isWiping ? 'Wiping...' : 'Yes, Permanently Wipe Everything'}
              </button>
              <button
                onClick={() => setShowConfirmWipe(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmWipe(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe All Local Student Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
