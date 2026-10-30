import React from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Bell,
  Scale,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { useTracker } from '../../context/TrackerContext';
import { useComparison } from '../../context/ComparisonContext';

interface AppHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAdvisor: () => void;
  openAuthModal: () => void;
  setIsMobileOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  setActiveTab,
  openAdvisor,
  openAuthModal,
  setIsMobileOpen,
  isSidebarCollapsed,
}) => {
  const { profile } = useUserProfile();
  const { isAuthenticated, logout } = useAuth();
  const { isReminderActive } = useTracker();
  const { selectedIds, openComparisonModal } = useComparison();

  // Tab Title & Subtitle Map
  const tabMeta: Record<ActiveTab, { title: string; subtitle: string; category: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Personalized grant matches & funding analytics',
      category: 'Workspace',
    },
    discover: {
      title: 'Discover Scholarships',
      subtitle: '204 verified central, state & CSR opportunities',
      category: 'Workspace',
    },
    tracker: {
      title: 'My Applications',
      subtitle: 'Application lifecycle & deadline pipeline',
      category: 'Workspace',
    },
    documents: {
      title: 'Document Vault',
      subtitle: 'Client-side encrypted local document store',
      category: 'Workspace',
    },
    planning: {
      title: 'Funding Planner',
      subtitle: 'Educational expense gap & aid optimization',
      category: 'Workspace',
    },
    calendar: {
      title: 'Deadlines & Calendar',
      subtitle: 'Verified schedule & in-app notifications',
      category: 'Workspace',
    },
    advisor: {
      title: 'AI Scholarship Advisor',
      subtitle: 'Grounded intelligence & eligibility analysis',
      category: 'Intelligence',
    },
    profile: {
      title: 'Student Profile',
      subtitle: 'Academic credentials, location & financial details',
      category: 'Account',
    },
    settings: {
      title: 'Settings & Data Privacy',
      subtitle: 'Client-side data controls & platform options',
      category: 'Account',
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu + Page Breadcrumb & Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Title */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>{currentMeta.category}</span>
                <span>/</span>
                <span className="text-emerald-700 font-bold">{currentMeta.title}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate hidden sm:block">
                {currentMeta.subtitle}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Quick Trigger */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setActiveTab('discover')}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-xs text-slate-500 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span className="truncate">Search scholarships, states, or courses...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Quick AI Advisor Trigger */}
            <button
              onClick={openAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100/80 text-violet-700 border border-violet-200 text-xs font-bold transition-all shadow-2xs"
              title="Open AI Scholarship Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Comparison Quick Action (if any items selected) */}
            {selectedIds.length > 0 && (
              <button
                onClick={openComparisonModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs animate-scaleUp"
                title="View Head-to-Head Comparison"
              >
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                <span>Compare ({selectedIds.length})</span>
              </button>
            )}

            {/* Calendar & Deadlines Notification Link */}
            <button
              onClick={() => setActiveTab('calendar')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="View Upcoming Verified Deadlines"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border-2 border-white" />
            </button>

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Student Auth / Profile Pill */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {profile?.fullName ? profile.fullName[0].toUpperCase() : 'S'}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[100px]">
                    {profile?.fullName ? profile.fullName.split(' ')[0] : 'Profile'}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors hidden sm:flex"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
