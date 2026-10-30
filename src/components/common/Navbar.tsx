import React from 'react';
import {
  GraduationCap,
  Search,
  Sparkles,
  BookmarkCheck,
  FileCheck2,
  PieChart,
  CalendarDays,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComparison } from '../../context/ComparisonContext';
import { ActiveTab } from '../../types/navigation';

export type { ActiveTab };

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAdvisor: () => void;
  openAuthModal: () => void;
  openSearchFocus?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAdvisor,
  openAuthModal,
  openSearchFocus,
}) => {
  const { isAuthenticated, demoPersona, user } = useAuth();
  const { selectedIds, openComparisonModal } = useComparison();

  const navLinks: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <PieChart className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover', icon: <Search className="w-4 h-4" /> },
    { id: 'tracker', label: 'My Applications', icon: <BookmarkCheck className="w-4 h-4" /> },
    { id: 'documents', label: 'Document Vault', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'planning', label: 'Funding Plan', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'calendar', label: 'Deadlines', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight font-display">
                  Scholarship<span className="text-emerald-700">Finder</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                  India
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Verified Higher Education Grants & Advisory</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => {
                setActiveTab('discover');
                if (openSearchFocus) openSearchFocus();
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search scholarships...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={openAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 text-xs font-bold transition-all shadow-xs"
              title="Open AI Scholarship Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Compare Counter */}
            {selectedIds.length > 0 && (
              <button
                onClick={openComparisonModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-all shadow-sm"
              >
                <span>Compare</span>
                <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] flex items-center justify-center font-extrabold">
                  {selectedIds.length}
                </span>
              </button>
            )}

            {/* Profile / Account Button */}
            <button
              onClick={isAuthenticated ? () => setActiveTab('profile') : openAuthModal}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 transition-all text-xs"
              title={isAuthenticated ? 'View Student Profile' : 'Sign in'}
            >
              {demoPersona?.avatar ? (
                <img
                  src={demoPersona.avatar}
                  alt={demoPersona.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="hidden md:inline font-semibold">
                {demoPersona ? demoPersona.name.split(' ')[0] : (user ? 'My Account' : 'Sign In')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
