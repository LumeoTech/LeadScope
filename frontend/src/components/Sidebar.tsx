import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Calendar,
  Flag,
  BarChart2,
  Users,
  Share2,
  HelpCircle,
  Settings,
  Search,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  ChevronDown,
  Globe,
  Mail,
  UserPlus,
  LogOut,
  User,
  Clock,
  Zap,
  Check,
  X
} from 'lucide-react';
import { UserInfo, api } from '../services/api';
import { accountManager, StoredAccount } from '../services/accountManager';
import { getUserTheme } from '../utils/userColors';
import { permissionsService } from '../services/permissionsService';

export type ActiveTab =
  | 'dashboard'
  | 'kanban'
  | 'scanner'
  | 'companies'
  | 'proposals'
  | 'agenda'
  | 'audit'
  | 'users'
  | 'campaigns'
  | 'goals'
  | 'sites'
  | 'templates';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser?: UserInfo | null;
  userRole?: string;
  pendingUsersCount?: number;
  onOpenHelp?: () => void;
  onOpenUpgrade?: () => void;
  onOpenCommandPalette?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  onAccountSwitched?: (user: UserInfo) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  userRole,
  pendingUsersCount = 0,
  onOpenHelp,
  onOpenCommandPalette,
  isCollapsed = false,
  onToggleCollapse,
  onLogout,
  onAccountSwitched
}) => {
  // Account Switcher & Multi-Login states
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);

  // Add Account form state
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Load saved accounts on menu open or mount
  useEffect(() => {
    const list = accountManager.getAccounts();
    setSavedAccounts(list);
  }, [isAccountMenuOpen]);

  // Active user theme
  const activeUser = currentUser || (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const activeTheme = getUserTheme(activeUser?.id, activeUser?.name);

  // Filter out currently active account from switch options
  const otherAccounts = savedAccounts.filter(
    (a) => a.user.email.toLowerCase() !== (activeUser?.email || '').toLowerCase()
  );

  // Dynamic permissions listener
  const [, setPermissionsTick] = useState(0);
  useEffect(() => {
    const handlePermChange = () => setPermissionsTick(t => t + 1);
    window.addEventListener('lumeo_permissions_changed', handlePermChange);
    return () => window.removeEventListener('lumeo_permissions_changed', handlePermChange);
  }, []);

  // Status da busca automática e média de score do dia (obtidos do banco Supabase)
  const [autoScanInfo, setAutoScanInfo] = useState<{ active: boolean; avgTodayScore: number }>({
    active: true,
    avgTodayScore: 88
  });

  useEffect(() => {
    let isMounted = true;
    const loadAutoScanMetrics = async () => {
      try {
        const analytics = await api.leads.getAutoScanAnalytics();
        if (analytics && isMounted) {
          setAutoScanInfo({
            active: Boolean(analytics.settings?.active),
            avgTodayScore: Math.round(analytics.todayAvgScore || analytics.averageScore || 88)
          });
        }
      } catch (err) {
        // Fallback silencioso sem quebrar o layout
      }
    };

    loadAutoScanMetrics();
    const interval = setInterval(loadAutoScanMetrics, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const userCurrentRole = activeUser?.role || userRole || 'VENDEDOR';
  const isAdmin = userCurrentRole.toUpperCase() === 'ADMIN';

  const canSeeLeads = permissionsService.hasPermission(userCurrentRole, 'can_view_leads') || permissionsService.hasPermission(userCurrentRole, 'can_view_campaigns');
  const canSeeAnalytics = permissionsService.hasPermission(userCurrentRole, 'can_view_analytics');
  const canSeeAgenda = permissionsService.hasPermission(userCurrentRole, 'can_view_agenda');
  const canSeeSites = permissionsService.hasPermission(userCurrentRole, 'can_view_sites');
  const canSeeTemplates = permissionsService.hasPermission(userCurrentRole, 'can_view_templates');
  const canSeeCompanies = permissionsService.hasPermission(userCurrentRole, 'can_view_companies');

  const handleSwitchAccount = (email: string) => {
    const switched = accountManager.switchAccount(email);
    if (switched) {
      if (onAccountSwitched) {
        onAccountSwitched(switched.user);
      }
      setIsAccountMenuOpen(false);
      window.location.reload();
    }
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = accountManager.removeAccount(email);
    setSavedAccounts(updated);
  };

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const result = await accountManager.loginNewAccount(addEmail.trim(), addPassword);
      if (onAccountSwitched) {
        onAccountSwitched(result.user);
      }
      setIsAddAccountModalOpen(false);
      setIsAccountMenuOpen(false);
      setAddEmail('');
      setAddPassword('');
      window.location.reload();
    } catch (err: any) {
      setAddError(err.message || 'Erro ao autenticar conta. Verifique email e senha.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        minWidth: isCollapsed ? '72px' : '240px',
        background: '#0f1012',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '18px 12px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden'
      }}
    >
      {/* 1. Header do Workspace & Troca de Conta (Efferd LLC / LeadScope) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '16px',
        padding: '0 4px',
        position: 'relative'
      }}>
        <div
          onClick={() => setIsAccountMenuOpen(prev => !prev)}
          title="Clique para alternar conta ou gerenciar logins"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '8px',
            background: isAccountMenuOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            transition: 'background 0.15s ease'
          }}
        >
          {/* Stylized Node/Flux Icon */}
          <div style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16" />
              <path d="M4 12h10" />
              <path d="M4 18h14" />
              <circle cx="18" cy="12" r="2" fill="#ffffff" />
            </svg>
          </div>

          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                Efferd LLC
              </span>
              <ChevronDown
                size={13}
                color="#6e7481"
                style={{
                  transform: isAccountMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Recolher menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#6e7481',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {/* 2. Campo de Busca no Menu (Atalho ⌘K) */}
      {!isCollapsed ? (
        <div
          onClick={onOpenCommandPalette}
          style={{
            position: 'relative',
            marginBottom: '18px',
            cursor: 'pointer'
          }}
          title="Search (⌘K)"
        >
          <Search size={14} color="#5e6471" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            style={{
              width: '100%',
              padding: '6px 36px 6px 32px',
              fontSize: '0.82rem',
              background: '#16171a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: '#8c93a0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '8px',
            top: '6px',
            fontSize: '0.68rem',
            color: '#686f7d',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1px 5px',
            borderRadius: '4px',
            background: '#1e2025'
          }}>
            ⌘ K
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Search (⌘K)"
          style={{
            width: '100%',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#16171a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            cursor: 'pointer',
            color: '#8c93a0'
          }}
        >
          <Search size={15} />
        </button>
      )}

      {/* 3. MENU PRINCIPAL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        {/* GRUPO 1: PRINCIPAL */}
        {!isCollapsed ? (
          <div style={{
            fontSize: '0.68rem',
            fontWeight: '400',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            padding: '8px 10px 4px 10px',
            userSelect: 'none'
          }}>
            PRINCIPAL
          </div>
        ) : (
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '6px 4px' }} />
        )}

        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          style={getNavItemStyle(activeTab === 'dashboard', isCollapsed)}
          title="Dashboard"
        >
          <LayoutGrid size={16} color={activeTab === 'dashboard' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        {/* Campaigns */}
        {canSeeLeads && (
          <button
            onClick={() => setActiveTab('kanban')}
            style={getNavItemStyle(activeTab === 'kanban', isCollapsed)}
            title="Campaigns"
          >
            <Flag size={16} color={activeTab === 'kanban' ? '#ffffff' : '#8c93a0'} />
            {!isCollapsed && <span>Campaigns</span>}
          </button>
        )}

        {/* Analytics */}
        {canSeeAnalytics && (
          <button
            onClick={() => setActiveTab('scanner')}
            style={getNavItemStyle(activeTab === 'scanner', isCollapsed)}
            title="Analytics"
          >
            <BarChart2 size={16} color={activeTab === 'scanner' ? '#ffffff' : '#8c93a0'} />
            {!isCollapsed && <span>Analytics</span>}
          </button>
        )}

        {/* GRUPO 2: CONTEÚDO */}
        {(canSeeAgenda || canSeeSites || canSeeTemplates) && (
          <>
            {!isCollapsed ? (
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '400',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#64748b',
                padding: '14px 10px 4px 10px',
                userSelect: 'none'
              }}>
                CONTEÚDO
              </div>
            ) : (
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '8px 4px' }} />
            )}

            {/* Content Calendar */}
            {canSeeAgenda && (
              <button
                onClick={() => setActiveTab('agenda')}
                style={getNavItemStyle(activeTab === 'agenda', isCollapsed)}
                title="Content Calendar"
              >
                <Calendar size={16} color={activeTab === 'agenda' ? '#ffffff' : '#8c93a0'} />
                {!isCollapsed && <span>Content Calendar</span>}
              </button>
            )}

            {/* Sites */}
            {canSeeSites && (
              <button
                onClick={() => setActiveTab('sites')}
                style={getNavItemStyle(activeTab === 'sites', isCollapsed)}
                title="Sites"
              >
                <Globe size={16} color={activeTab === 'sites' ? '#ffffff' : '#8c93a0'} />
                {!isCollapsed && <span>Sites</span>}
              </button>
            )}

            {/* Templates */}
            {canSeeTemplates && (
              <button
                onClick={() => setActiveTab('templates')}
                style={getNavItemStyle(activeTab === 'templates', isCollapsed)}
                title="Templates"
              >
                <Mail size={16} color={activeTab === 'templates' ? '#ffffff' : '#8c93a0'} />
                {!isCollapsed && <span>Templates</span>}
              </button>
            )}
          </>
        )}

        {/* GRUPO 3: GESTÃO */}
        {(isAdmin || canSeeCompanies) && (
          <>
            {!isCollapsed ? (
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '400',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#64748b',
                padding: '14px 10px 4px 10px',
                userSelect: 'none'
              }}>
                GESTÃO
              </div>
            ) : (
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '8px 4px' }} />
            )}

            {/* Team - Visível EXCLUSIVAMENTE para Admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                style={getNavItemStyle(activeTab === 'users', isCollapsed)}
                title="Team"
              >
                <Users size={16} color={activeTab === 'users' ? '#ffffff' : '#8c93a0'} />
                {!isCollapsed && (
                  <>
                    <span style={{ flex: 1 }}>Team</span>
                    {Boolean(pendingUsersCount && pendingUsersCount > 0) && (
                      <span style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {pendingUsersCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Integrations */}
            {canSeeCompanies && (
              <button
                onClick={() => setActiveTab('companies')}
                style={getNavItemStyle(activeTab === 'companies', isCollapsed)}
                title="Integrations"
              >
                <Share2 size={16} color={activeTab === 'companies' ? '#ffffff' : '#8c93a0'} />
                {!isCollapsed && <span>Integrations</span>}
              </button>
            )}
          </>
        )}
      </div>

      {/* 4. BLOCO ÚTIL NO RODAPÉ: Status da busca automática & Score médio do dia */}
      {!isCollapsed ? (
        <div style={{
          marginTop: 'auto',
          marginBottom: '10px',
          padding: '10px 12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: autoScanInfo.active ? '#10b981' : '#f59e0b',
                boxShadow: autoScanInfo.active ? '0 0 6px #10b981' : '0 0 6px #f59e0b',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: '600' }}>
                Busca {autoScanInfo.active ? 'Ativa' : 'Pausada'}
              </span>
            </div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              color: autoScanInfo.active ? '#34d399' : '#fbbf24',
              background: autoScanInfo.active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}>
              {autoScanInfo.active ? 'ON' : 'PAUSA'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#8c93a0' }}>
            <span>Média hoje</span>
            <strong style={{ color: '#ffffff', fontWeight: '700' }}>
              {autoScanInfo.avgTodayScore}%
            </strong>
          </div>
        </div>
      ) : (
        <div
          title={`Busca Automática: ${autoScanInfo.active ? 'Ativa' : 'Pausada'} • Média hoje: ${autoScanInfo.avgTodayScore}%`}
          style={{
            marginTop: 'auto',
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 0',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: autoScanInfo.active ? '#10b981' : '#f59e0b',
            boxShadow: autoScanInfo.active ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
          }} />
        </div>
      )}

      {/* 5. FOOTER / SUPPORT & SETTINGS (Separados por linha divisória fina) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '10px'
      }}>
        <button
          type="button"
          onClick={onOpenHelp}
          style={getNavItemStyle(false, isCollapsed)}
          title="Support"
        >
          <HelpCircle size={16} color="#8c93a0" />
          {!isCollapsed && <span>Support</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          style={getNavItemStyle(activeTab === 'audit', isCollapsed)}
          title="Settings"
        >
          <Settings size={16} color="#8c93a0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Bottom copyright line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: '12px 6px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          marginTop: '8px',
          color: '#555b67',
          fontSize: '0.72rem'
        }}>
          {!isCollapsed && <span>© Efferd LLC</span>}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir' : 'Recolher'}
            style={{
              background: 'none',
              border: 'none',
              color: '#555b67',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isCollapsed ? <ChevronsRight size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      {/* Popover de Troca de Conta e Gerenciamento de Login */}
      {isAccountMenuOpen && (
        <>
          <div
            onClick={() => setIsAccountMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: isCollapsed ? '16px' : '56px',
              left: isCollapsed ? '76px' : '14px',
              width: '290px',
              background: '#121316',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85)',
              zIndex: 9999,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            {/* Header do Popover com Workspace */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>Efferd LLC</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#6e7481', fontWeight: '600', textTransform: 'uppercase' }}>Workspace</span>
            </div>

            {/* Conta Ativa Atual */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6e7481', fontWeight: '700', marginBottom: '8px' }}>
                Conta Ativa Conectada
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: activeTheme.bg,
                  border: `2px solid ${activeTheme.border}`,
                  color: activeTheme.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  boxShadow: `0 0 10px ${activeTheme.glow}`,
                  flexShrink: 0
                }}>
                  {(activeUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeUser?.name || 'Usuário Atual'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeUser?.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: activeTheme.bg,
                  color: activeTheme.text,
                  border: `1px solid ${activeTheme.border}40`,
                  textTransform: 'uppercase'
                }}>
                  {activeUser?.role || 'User'}
                </span>
              </div>
            </div>

            {/* Lista de Outras Contas Conectadas */}
            {otherAccounts.length > 0 && (
              <div style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6e7481', fontWeight: '700', padding: '4px 8px', marginBottom: '4px' }}>
                  Alternar Conta (1 Clique)
                </div>
                {otherAccounts.map((acc) => {
                  const accTheme = getUserTheme(acc.user.id, acc.user.name);
                  return (
                    <div
                      key={acc.user.email}
                      onClick={() => handleSwitchAccount(acc.user.email)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 8px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        gap: '8px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: accTheme.bg,
                          border: `1px solid ${accTheme.border}`,
                          color: accTheme.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {(acc.user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {acc.user.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {acc.user.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, acc.user.email)}
                        title="Remover sessão salva"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6e7481',
                          cursor: 'pointer',
                          padding: '3px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6e7481')}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ações Rápidas */}
            <div style={{ padding: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsAddAccountModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#60a5fa',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <UserPlus size={15} />
                <span>+ Adicionar outro login</span>
              </button>

              {activeUser?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setActiveTab('users');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9ca3af',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Users size={15} />
                  <span>Gerenciar Usuários</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} />
                  <span>Sair desta conta</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Adicionar Outra Conta / Novo Login */}
      {isAddAccountModalOpen && (
        <div
          onClick={() => setIsAddAccountModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '400px',
              background: '#16171c',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
                  Conectar Outra Conta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#6e7481', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '18px', lineHeight: 1.4 }}>
              Faça login com outro perfil de usuário. As credenciais ficarão salvas para que você alterne com apenas 1 clique no menu lateral.
            </p>

            {addError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '16px'
              }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                  E-mail da conta *
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="exemplo@crmscanner.com"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={addLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addLoading || !addEmail || !addPassword}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {addLoading ? (
                    <>
                      <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <span>Conectar e Salvar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

const getNavItemStyle = (isActive: boolean, isCollapsed: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: isCollapsed ? 'center' : 'flex-start',
  gap: '10px',
  padding: '9px 12px',
  borderRadius: '8px',
  background: isActive ? '#22252a' : 'transparent',
  color: isActive ? '#ffffff' : '#8c93a0',
  fontSize: '0.84rem',
  fontWeight: isActive ? '600' : '500',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  transition: 'all 0.15s ease'
});
