import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { UserInfo, api } from './services/api';
import { accountManager } from './services/accountManager';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { HelpModal } from './components/HelpModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { permissionsService } from './services/permissionsService';

// ── Lazy-loaded views (cada uma em chunk separado) ────────────────────
const DashboardView      = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const KanbanView         = lazy(() => import('./views/KanbanView').then(m => ({ default: m.KanbanView })));
const ScannerView        = lazy(() => import('./views/ScannerView').then(m => ({ default: m.ScannerView })));
const CompaniesView      = lazy(() => import('./views/CompaniesView').then(m => ({ default: m.CompaniesView })));
const ProposalsView      = lazy(() => import('./views/ProposalsView').then(m => ({ default: m.ProposalsView })));
const AgendaView         = lazy(() => import('./views/AgendaView').then(m => ({ default: m.AgendaView })));
const AuditView          = lazy(() => import('./views/AuditView').then(m => ({ default: m.AuditView })));
const UsersView          = lazy(() => import('./views/UsersView').then(m => ({ default: m.UsersView })));
const PublicAgreementView = lazy(() => import('./views/PublicAgreementView').then(m => ({ default: m.PublicAgreementView })));
const AcceptInviteView   = lazy(() => import('./views/AcceptInviteView').then(m => ({ default: m.AcceptInviteView })));

export const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [initializing, setInitializing] = useState(true);
  const [pendingUsersCount, setPendingUsersCount] = useState<number>(0);

  // Modals & UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lumeo_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lumeo_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const loadPendingUsersCount = useCallback(async () => {
    try {
      const count = await api.users.countPending();
      setPendingUsersCount(count || 0);
    } catch (e) {
      // Ignore if unauthenticated or error
    }
  }, []);

  useEffect(() => {
    // 1. Processa retorno de OAuth do Supabase (#access_token=...)
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        if (accessToken) {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          const oauthUser: UserInfo = {
            id: 1,
            name: payload.user_metadata?.full_name || payload.user_metadata?.name || payload.email?.split('@')[0] || 'Usuário',
            email: payload.email || 'usuario@lumeo.com',
            role: payload.app_metadata?.role || 'ADMIN'
          };
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(oauthUser));
          setUser(oauthUser);
          window.history.replaceState(null, '', window.location.pathname);
          setInitializing(false);
          return;
        }
      } catch (e) {
        console.error('Erro ao processar token OAuth do Supabase:', e);
      }
    }

    const savedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user') ||
      localStorage.getItem('crm_user_info') ||
      sessionStorage.getItem('crm_user_info');
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('crm_auth_token') ||
      sessionStorage.getItem('crm_auth_token');

    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    setInitializing(false);

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('leadscope_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('leadscope_auth_expired', handleAuthExpired);
  }, []);

  // Synchronize current active session in accountManager
  useEffect(() => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('crm_auth_token') ||
      sessionStorage.getItem('crm_auth_token');
    if (user && token) {
      accountManager.saveCurrentSession(token, user);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadPendingUsersCount();
      const interval = setInterval(loadPendingUsersCount, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user, loadPendingUsersCount]);

  useEffect(() => {
    if (!user) return;
    const role = user.role || 'VENDEDOR';

    // A tela de Team só é visível para Admin. Qualquer outro cargo é redirecionado imediatamente ao tentar acessar.
    if (activeTab === 'users' && role !== 'ADMIN') {
      setActiveTab('kanban');
      return;
    }

    // Verificação de permissões em tempo real por tela
    if (activeTab === 'kanban' && !permissionsService.hasPermission(role, 'can_view_leads')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'companies' && !permissionsService.hasPermission(role, 'can_view_companies')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'agenda' && !permissionsService.hasPermission(role, 'can_view_agenda')) {
      setActiveTab('dashboard');
    } else if (activeTab === 'scanner' && !permissionsService.hasPermission(role, 'can_view_analytics')) {
      setActiveTab('dashboard');
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
    if (user?.email) {
      accountManager.removeAccount(user.email);
    }
    const remaining = accountManager.getAccounts();
    if (remaining.length > 0) {
      const next = accountManager.switchAccount(remaining[0].user.email);
      if (next) {
        setUser(next.user);
        return;
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  // Check for public digital acceptance route (/aceite/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/aceite/')) {
    const token = pathname.replace('/aceite/', '').split('/')[0];
    return (
      <Suspense fallback={<ViewSkeleton />}>
        <PublicAgreementView token={token} />
      </Suspense>
    );
  }

  // Check for accept invite route or supabase invite link (/invite, /accept-invite, or #type=invite)
  if (pathname.startsWith('/invite') || pathname.startsWith('/accept-invite') || window.location.hash.includes('type=invite')) {
    return (
      <Suspense fallback={<ViewSkeleton />}>
        <AcceptInviteView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      </Suspense>
    );
  }

  if (initializing) {
    return null;
  }

  if (!user) {
    return <LoginView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg, #f5f5f7)', color: 'var(--text, #1d1d1f)' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={user}
        userRole={user.role}
        pendingUsersCount={pendingUsersCount}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onLogout={handleLogout}
        onAccountSwitched={(newUser) => setUser(newUser)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigateTab={(tab) => setActiveTab(tab)}
          pendingUsersCount={pendingUsersCount}
        />

        <main className="main-content" style={{ flex: 1, paddingTop: '12px' }}>
          <Suspense fallback={<ViewSkeleton />}>
            {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} currentUser={user} />}
            {activeTab === 'kanban' && <KanbanView />}
            {activeTab === 'scanner' && <ScannerView onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === 'companies' && <CompaniesView />}
            {activeTab === 'proposals' && <ProposalsView />}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'users' && <UsersView onRefreshPendingCount={loadPendingUsersCount} />}
            {activeTab === 'audit' && <AuditView />}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
    </div>
  );
};

// ── Skeleton fallback para Suspense ──────────────────────────────────
const ViewSkeleton: React.FC = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="skeleton" style={{ height: '32px', width: '240px', borderRadius: '8px' }} />
    <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
    <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
    <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
  </div>
);

export default App;
