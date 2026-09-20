import React, { useState, useEffect, useCallback } from 'react';
import { UserInfo, api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { KanbanView } from './views/KanbanView';
import { ScannerView } from './views/ScannerView';
import { CompaniesView } from './views/CompaniesView';
import { ProposalsView } from './views/ProposalsView';
import { AgendaView } from './views/AgendaView';
import { AuditView } from './views/AuditView';
import { UsersView } from './views/UsersView';
import { CampaignsView } from './views/CampaignsView';
import { GoalsView } from './views/GoalsView';
import { HelpModal } from './components/HelpModal';
import { UpgradeModal } from './components/UpgradeModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { PublicAgreementView } from './views/PublicAgreementView';
import { SitesView } from './views/SitesView';
import { AcceptInviteView } from './views/AcceptInviteView';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [initializing, setInitializing] = useState(true);
  const [pendingUsersCount, setPendingUsersCount] = useState<number>(0);

  // Modals & UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Check for public digital acceptance route (/aceite/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/aceite/')) {
    const token = pathname.replace('/aceite/', '').split('/')[0];
    return <PublicAgreementView token={token} />;
  }

  // Check for accept invite route or supabase invite link (/invite, /accept-invite, or #type=invite)
  if (pathname.startsWith('/invite') || pathname.startsWith('/accept-invite') || window.location.hash.includes('type=invite')) {
    return <AcceptInviteView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const loadPendingUsersCount = useCallback(async () => {
    try {
      const count = await api.users.countPending();
      setPendingUsersCount(count || 0);
    } catch (e) {
      // Ignore if unauthenticated or error
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadPendingUsersCount();
      const interval = setInterval(loadPendingUsersCount, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user, loadPendingUsersCount]);

  useEffect(() => {
    if ((user?.role === 'VENDEDOR' || user?.role === 'VIEWER') && (activeTab === 'audit' || activeTab === 'users' || activeTab === 'sites')) {
      setActiveTab('kanban');
    }
  }, [user, activeTab]);

  // Global Keyboard shortcut: ⌘K or Ctrl+K opens Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (initializing) {
    return null;
  }

  if (!user) {
    return <LoginView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0c0d0f' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={user.role}
        pendingUsersCount={pendingUsersCount}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigateTab={(tab) => setActiveTab(tab)}
          pendingUsersCount={pendingUsersCount}
        />

        <main className="main-content" style={{ flex: 1, paddingTop: '12px' }}>
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'scanner' && <ScannerView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'companies' && <CompaniesView />}
          {activeTab === 'proposals' && <ProposalsView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'users' && <UsersView onRefreshPendingCount={loadPendingUsersCount} />}
          {activeTab === 'audit' && <AuditView />}
          {activeTab === 'sites' && <SitesView />}
        </main>
      </div>

      {/* Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />
    </div>
  );
};

export default App;
