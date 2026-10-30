import React from 'react';
import {
  LayoutDashboard,
  Search,
  BookmarkCheck,
  FileCheck2,
  SlidersHorizontal,
  CalendarDays,
  Sparkles,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from '../../types/navigation';
import { BrandLogo } from '../common/BrandLogo';
import { useUserProfile } from '../../context/UserProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useTracker } from '../../context/TrackerContext';
import { useDocumentVault } from '../../context/DocumentVaultContext';

interface AppSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAdvisor: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  openAuthModal: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  openAdvisor,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  openAuthModal,
}) => {
  const { profile } = useUserProfile();
  const { isAuthenticated, logout } = useAuth();
  const { trackerItems } = useTracker();
  const { documents } = useDocumentVault();

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === 'advisor') {
      openAdvisor();
    } else {
      setActiveTab(tab);
    }
    setIsMobileOpen(false);
  };

  const workspaceNav = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: 'discover' as ActiveTab,
      label: 'Discover Scholarships',
      icon: <Search className="w-4 h-4 flex-shrink-0" />,
      badge: '204',
      badgeColor: 'bg-electric-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'tracker' as ActiveTab,
      label: 'My Applications',
      icon: <BookmarkCheck className="w-4 h-4 flex-shrink-0" />,
      badge: trackerItems.length > 0 ? String(trackerItems.length) : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'documents' as ActiveTab,
      label: 'Document Vault',
      icon: <FileCheck2 className="w-4 h-4 flex-shrink-0" />,
      badge: documents.length > 0 ? String(documents.length) : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'planning' as ActiveTab,
      label: 'Funding Planner',
      icon: <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Deadlines & Calendar',
      icon: <CalendarDays className="w-4 h-4 flex-shrink-0" />,
    },
  ];

  const intelligenceNav = [
    {
      id: 'advisor' as ActiveTab,
      label: 'AI Scholarship Advisor',
      icon: <Sparkles className="w-4 h-4 flex-shrink-0 text-violet-400" />,
      badge: 'Grounded',
      badgeColor: 'bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse',
    },
  ];

  const accountNav = [
    {
      id: 'profile' as ActiveTab,
      label: 'My Profile',
      icon: <User className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Privacy',
      icon: <Settings className="w-4 h-4 flex-shrink-0" />,
    },
  ];

  // Helper initials
  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-midnight-950 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Brand Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 flex-shrink-0">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="cursor-pointer overflow-hidden"
          >
            <BrandLogo theme="dark" isCollapsed={isCollapsed} />
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-dark py-4 px-3 space-y-6">
          {/* SECTION: WORKSPACE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Workspace
              </div>
            )}
            {workspaceNav.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <span
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SECTION: INTELLIGENCE */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Intelligence
              </div>
            )}
            {intelligenceNav.map(item => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative bg-violet-950/40 hover:bg-violet-900/40 text-violet-200 border border-violet-800/50 hover:border-violet-600/60 shadow-xs ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <span className="text-violet-400 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate text-violet-100 font-bold">
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SECTION: ACCOUNT */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Account
              </div>
            )}
            {accountNav.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <span
                    className={`${
                      isActive
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom: Student Profile Card */}
        <div className="p-3 border-t border-slate-800/80 bg-midnight-950/80 flex-shrink-0">
          <div
            onClick={() => handleNavClick('profile')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {/* Student Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-midnight-950" />
            </div>

            {/* Profile Info */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {profile?.fullName || 'Student Applicant'}
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>{profile?.academic.course || 'Undergraduate'}</span>
                  {profile?.location.state && (
                    <>
                      <span>•</span>
                      <span>{profile.location.state}</span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
