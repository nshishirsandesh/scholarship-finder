import React from 'react';
import { PieChart, Search, BookmarkCheck, Sparkles, User } from 'lucide-react';
import { ActiveTab } from '../../types/navigation';
import { useTracker } from '../../context/TrackerContext';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAdvisor: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  openAdvisor,
}) => {
  const { savedScholarshipIds } = useTracker();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-5 items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'discover' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'tracker' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookmarkCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tracker</span>
          {savedScholarshipIds.length > 0 && (
            <span className="absolute top-0 right-4 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
              {savedScholarshipIds.length}
            </span>
          )}
        </button>

        <button
          onClick={openAdvisor}
          className="flex flex-col items-center justify-center py-1 text-emerald-700 hover:text-emerald-800"
        >
          <div className="p-1 rounded-full bg-emerald-50 border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold">Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  );
};
