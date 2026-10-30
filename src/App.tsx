import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProfileProvider, useUserProfile } from './context/UserProfileContext';
import { TrackerProvider } from './context/TrackerContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { DocumentVaultProvider } from './context/DocumentVaultContext';
import { ToastProvider } from './components/common/Toast';

import { ActiveTab } from './types/navigation';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { MobileNav } from './components/common/MobileNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { DiscoverView } from './components/search/DiscoverView';
import { TrackerBoard } from './components/tracker/TrackerBoard';
import { DocumentChecklist } from './components/documents/DocumentChecklist';
import { FundingPlannerView } from './components/planning/FundingPlannerView';
import { ActionPlanView } from './components/planning/ActionPlanView';
import { DeadlineCalendar } from './components/calendar/DeadlineCalendar';
import { ProfileEditView } from './components/profile/ProfileEditView';
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

import { PhoneLoginModal } from './components/auth/PhoneLoginModal';
import { EligibilityModal } from './components/eligibility/EligibilityModal';
import { ComparisonBar } from './components/comparison/ComparisonBar';
import { ComparisonModal } from './components/comparison/ComparisonModal';
import { AdvisorChatModal } from './components/advisor/AdvisorChatModal';

import { Scholarship } from './types/scholarship';
import { EligibilityResult } from './types/eligibility';
import { UserProfile } from './types/user';
import { SlidersHorizontal, ListChecks } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { profile, saveOnboarding } = useUserProfile();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [planningSubTab, setPlanningSubTab] = useState<'funding' | 'action_plan'>('funding');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [auditScholarship, setAuditScholarship] = useState<Scholarship | null>(null);
  const [auditEligibility, setAuditEligibility] = useState<EligibilityResult | null>(null);

  // Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('discover');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAudit = (scholarship: Scholarship, eligibility: EligibilityResult) => {
    setAuditScholarship(scholarship);
    setAuditEligibility(eligibility);
  };

  const handleCompleteOnboarding = async (newProfile: UserProfile) => {
    await saveOnboarding(newProfile);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 flex">
      {/* 1. Left Sidebar Navigation (Desktop Fixed & Mobile Drawer) */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAdvisor={() => setIsAdvisorOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <AppHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openAdvisor={() => setIsAdvisorOpen(true)}
          openAuthModal={() => setIsAuthModalOpen(true)}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Page Content View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-12">
          {/* If user has not completed onboarding, present onboarding wizard */}
          {!profile || !profile.isOnboardingCompleted ? (
            <OnboardingWizard
              initialProfile={profile}
              onComplete={handleCompleteOnboarding}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenAudit={handleOpenAudit}
                  setActiveTab={setActiveTab}
                  openAdvisor={() => setIsAdvisorOpen(true)}
                />
              )}

              {activeTab === 'discover' && (
                <DiscoverView onOpenAudit={handleOpenAudit} />
              )}

              {activeTab === 'tracker' && <TrackerBoard />}

              {activeTab === 'documents' && <DocumentChecklist />}

              {activeTab === 'planning' && (
                <div className="space-y-6">
                  {/* Planning Sub-Tabs */}
                  <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-slate-200/90 w-fit shadow-2xs">
                    <button
                      onClick={() => setPlanningSubTab('funding')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        planningSubTab === 'funding'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Funding Gap Calculator</span>
                    </button>
                    <button
                      onClick={() => setPlanningSubTab('action_plan')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        planningSubTab === 'action_plan'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ListChecks className="w-4 h-4" />
                      <span>Personalized Action Plan</span>
                    </button>
                  </div>

                  {planningSubTab === 'funding' ? (
                    <FundingPlannerView />
                  ) : (
                    <ActionPlanView />
                  )}
                </div>
              )}

              {activeTab === 'calendar' && <DeadlineCalendar />}

              {activeTab === 'profile' && <ProfileEditView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Sticky Comparison Bar */}
      <ComparisonBar />

      {/* Mobile Bottom App Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Modals */}
      <PhoneLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <EligibilityModal
        isOpen={Boolean(auditScholarship && auditEligibility)}
        onClose={() => {
          setAuditScholarship(null);
          setAuditEligibility(null);
        }}
        scholarship={auditScholarship}
        eligibility={auditEligibility}
      />

      <ComparisonModal />

      <AdvisorChatModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <DocumentVaultProvider>
          <TrackerProvider>
            <ComparisonProvider>
              <ToastProvider>
                <MainAppContent />
              </ToastProvider>
            </ComparisonProvider>
          </TrackerProvider>
        </DocumentVaultProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}

export default App;
