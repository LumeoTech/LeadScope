import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Building2,
  CalendarDays,
  Users,
  HelpCircle,
  Settings,
  Search,
  PanelLeftClose,
  PanelLeft,
  UserPlus,
  LogOut,
  X,
  ScanSearch,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserInfo } from '../services/api';
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
  onOpenCommandPalette?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  onAccountSwitched?: (user: UserInfo) => void;
}

interface NavItemDef {
  tab: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Keyboard shortcut ⌘/Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  useEffect(() => {
    const list = accountManager.getAccounts();
    setSavedAccounts(list);
  }, [isAccountMenuOpen]);

  const activeUser = currentUser || (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const activeTheme = getUserTheme(activeUser?.id, activeUser?.name);
  const otherAccounts = savedAccounts.filter(
    (a) => a.user.email.toLowerCase() !== (activeUser?.email || '').toLowerCase()
  );

  const userCurrentRole = activeUser?.role || userRole || 'VENDEDOR';
  const isAdmin = userCurrentRole.toUpperCase() === 'ADMIN';
  const canSeeLeads = permissionsService.hasPermission(userCurrentRole, 'can_view_leads');
  const canSeeAnalytics = permissionsService.hasPermission(userCurrentRole, 'can_view_analytics');
  const canSeeAgenda = permissionsService.hasPermission(userCurrentRole, 'can_view_agenda');
  const canSeeCompanies = permissionsService.hasPermission(userCurrentRole, 'can_view_companies');

  const handleSwitchAccount = (email: string) => {
    const switched = accountManager.switchAccount(email);
    if (switched) {
      if (onAccountSwitched) onAccountSwitched(switched.user);
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
      if (onAccountSwitched) onAccountSwitched(result.user);
      setIsAddAccountModalOpen(false);
      setIsAccountMenuOpen(false);
      setAddEmail('');
      setAddPassword('');
      window.location.reload();
    } catch (err: unknown) {
      setAddError((err as Error).message || 'Erro ao autenticar. Verifique email e senha.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    }, 1400);
  };

  const mainNavItems: NavItemDef[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(canSeeLeads ? [{ tab: 'kanban' as ActiveTab, label: 'Leads', icon: Kanban }] : []),
    ...(canSeeAnalytics ? [{ tab: 'scanner' as ActiveTab, label: 'Prospecção', icon: ScanSearch }] : []),
    ...(canSeeCompanies ? [{ tab: 'companies' as ActiveTab, label: 'Clientes', icon: Building2 }] : []),
    ...(canSeeAgenda ? [{ tab: 'agenda' as ActiveTab, label: 'Agenda', icon: CalendarDays }] : [])
  ];

  const adminNavItems: NavItemDef[] = isAdmin ? [
    { tab: 'users', label: 'Equipe', icon: Users, badge: pendingUsersCount },
    { tab: 'audit', label: 'Auditoria', icon: ShieldCheck }
  ] : [];

  const userInitials = (activeUser?.name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {/* ── DESKTOP SIDEBAR (ClickUp style: 240px expanded ↔ 64px rail) ── */}
      <aside
        className="lumeo-sidebar"
        style={{
          width: isCollapsed ? '64px' : '240px',
          minWidth: isCollapsed ? '64px' : '240px',
          maxWidth: isCollapsed ? '64px' : '240px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'var(--surface-glass, rgba(17, 18, 22, 0.85))',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRight: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transition: 'width 280ms cubic-bezier(0.32, 0.72, 0, 1), min-width 280ms cubic-bezier(0.32, 0.72, 0, 1), max-width 280ms cubic-bezier(0.32, 0.72, 0, 1)',
          overflowX: 'visible',
          overflowY: 'hidden',
          userSelect: 'none',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header: Logo + Collapse/Expand Button */}
        <div
          style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0 8px' : '0 14px',
            borderBottom: '1px solid var(--line, rgba(255, 255, 255, 0.06))',
            position: 'relative'
          }}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              onMouseEnter={() => setHoveredTab('brand-toggle')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Expandir barra lateral (⌘B)"
              aria-label="Expandir barra lateral"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: hoveredTab === 'brand-toggle' ? 'rgba(128, 128, 128, 0.12)' : 'linear-gradient(135deg, #1d2433 0%, #0d121c 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                position: 'relative',
                padding: 0
              }}
            >
              {hoveredTab === 'brand-toggle' ? (
                <PanelLeft size={18} strokeWidth={1.75} color="var(--accent, #0071e3)" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16" />
                  <path d="M4 12h10" />
                  <circle cx="18" cy="12" r="2.5" fill="#3b82f6" stroke="none" />
                  <path d="M4 18h14" />
                </svg>
              )}
              {hoveredTab === 'brand-toggle' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '46px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#1d1d1f',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Expandir barra lateral (⌘B)
                </div>
              )}
            </button>
          ) : (
            <>
              {/* Logo Brand Link */}
              <div
                onClick={() => setActiveTab('dashboard')}
                title="Lumeo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  minWidth: 0,
                  textDecoration: 'none'
                }}
              >
                {/* Lumeo 32px Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1d2433 0%, #0d121c 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16" />
                    <path d="M4 12h10" />
                    <circle cx="18" cy="12" r="2.5" fill="#3b82f6" stroke="none" />
                    <path d="M4 18h14" />
                  </svg>
                </div>

                {/* Brand text (only visible when expanded) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text, #f5f5f7)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2
                    }}
                  >
                    Lumeo
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-3, #86868b)',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Inteligência Comercial
                  </span>
                </div>
              </div>

              {/* Toggle Panel Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Recolher barra lateral (⌘B)"
                aria-label="Recolher barra lateral"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-2, #86868b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 150ms ease, color 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(128, 128, 128, 0.12)';
                  e.currentTarget.style.color = 'var(--text, #f5f5f7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-2, #86868b)';
                }}
              >
                <PanelLeftClose size={18} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        {/* Quick Search Button (⌘K) */}
        <div style={{ padding: isCollapsed ? '10px 8px 6px' : '12px 14px 8px' }}>
          {isCollapsed ? (
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onOpenCommandPalette}
                onMouseEnter={() => setHoveredTab('search')}
                onMouseLeave={() => setHoveredTab(null)}
                title="Pesquisar (⌘K)"
                aria-label="Pesquisar (⌘K)"
                style={{
                  width: '48px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
                  background: 'rgba(128, 128, 128, 0.06)',
                  color: 'var(--text-2, #86868b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 150ms ease, color 150ms ease'
                }}
              >
                <Search size={18} strokeWidth={1.75} />
              </button>

              {/* Tooltip on hover */}
              {hoveredTab === 'search' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '56px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#1d1d1f',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  Pesquisar (⌘K)
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={onOpenCommandPalette}
              title="Pesquisar (⌘K)"
              style={{
                width: '100%',
                height: '36px',
                padding: '0 10px',
                borderRadius: '10px',
                border: '1px solid var(--line, rgba(255, 255, 255, 0.08))',
                background: 'rgba(128, 128, 128, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: 'var(--text-2, #86868b)',
                fontSize: '13px',
                transition: 'background 150ms ease, border-color 150ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={15} strokeWidth={1.75} />
                <span>Pesquisar...</span>
              </div>
              <kbd
                style={{
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  padding: '2px 5px',
                  borderRadius: '5px',
                  background: 'rgba(128, 128, 128, 0.14)',
                  color: 'var(--text-2, #86868b)'
                }}
              >
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch',
            gap: isCollapsed ? '6px' : '2px',
            padding: isCollapsed ? '8px 0' : '8px 10px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;
            const isHovered = hoveredTab === item.tab;

            if (isCollapsed) {
              return (
                <div key={item.tab} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    onMouseEnter={() => setHoveredTab(item.tab)}
                    onMouseLeave={() => setHoveredTab(null)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: '10px',
                      background: isActive
                        ? 'rgba(0, 113, 227, 0.12)'
                        : isHovered
                        ? 'rgba(128, 128, 128, 0.08)'
                        : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--accent, #0071e3)' : 'var(--text-2, #86868b)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      transition: 'background 150ms ease, color 150ms ease'
                    }}
                  >
                    <Icon size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: 1,
                        letterSpacing: '-0.01em',
                        textAlign: 'center',
                        maxWidth: '44px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '6px',
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#ff3b30'
                        }}
                      />
                    )}
                  </button>

                  {/* Tooltip to the right on hover (ClickUp reference) */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '56px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#1d1d1f',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '4px 9px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </div>
              );
            }

            // Expanded mode item
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--accent, #0071e3)' : 'var(--text-2, #86868b)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 150ms ease, color 150ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(128, 128, 128, 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.label}
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span
                    style={{
                      background: 'var(--danger, #ff3b30)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin section if present */}
          {adminNavItems.length > 0 && (
            <>
              <div
                style={{
                  height: '1px',
                  background: 'var(--line, rgba(255, 255, 255, 0.06))',
                  margin: isCollapsed ? '8px 4px' : '10px 6px',
                  width: isCollapsed ? '32px' : 'auto'
                }}
              />
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-3, #86868b)',
                    padding: '2px 12px 4px'
                  }}
                >
                  Administração
                </div>
              )}
              {adminNavItems.map((item) => {
                const isActive = activeTab === item.tab;
                const Icon = item.icon;
                const isHovered = hoveredTab === item.tab;

                if (isCollapsed) {
                  return (
                    <div key={item.tab} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.tab)}
                        onMouseEnter={() => setHoveredTab(item.tab)}
                        onMouseLeave={() => setHoveredTab(null)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        style={{
                          width: '48px',
                          height: '52px',
                          borderRadius: '10px',
                          background: isActive
                            ? 'rgba(0, 113, 227, 0.12)'
                            : isHovered
                            ? 'rgba(128, 128, 128, 0.08)'
                            : 'transparent',
                          border: 'none',
                          color: isActive ? 'var(--accent, #0071e3)' : 'var(--text-2, #86868b)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                          padding: 0,
                          position: 'relative',
                          transition: 'background 150ms ease, color 150ms ease'
                        }}
                      >
                        <Icon size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                            textAlign: 'center',
                            maxWidth: '44px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.label}
                        </span>
                      </button>

                      {isHovered && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '56px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#1d1d1f',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '4px 9px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(0, 113, 227, 0.12)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--accent, #0071e3)' : 'var(--text-2, #86868b)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 150ms ease, color 150ms ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(128, 128, 128, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500, flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* ── Base do Trilho (ClickUp Reference: Convidar, Ajuda, Avatar) ── */}
        <div
          style={{
            borderTop: '1px solid var(--line, rgba(255, 255, 255, 0.06))',
            padding: isCollapsed ? '10px 0' : '10px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch',
            gap: '6px'
          }}
        >
          {/* Convidar usuário */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              onMouseEnter={() => setHoveredTab('invite')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Convidar membro"
              aria-label="Convidar membro"
              style={{
                width: isCollapsed ? '48px' : '100%',
                height: isCollapsed ? '44px' : '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-2, #86868b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? 0 : '0 12px',
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease'
              }}
            >
              <UserPlus size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>Convidar membro</span>}
            </button>
            {isCollapsed && hoveredTab === 'invite' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1d1d1f',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 9px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Convidar membro
              </div>
            )}
          </div>

          {/* Ajuda / Suporte */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={onOpenHelp}
              onMouseEnter={() => setHoveredTab('help')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Ajuda & Suporte"
              aria-label="Ajuda & Suporte"
              style={{
                width: isCollapsed ? '48px' : '100%',
                height: isCollapsed ? '44px' : '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-2, #86868b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? 0 : '0 12px',
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease'
              }}
            >
              <HelpCircle size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>Ajuda</span>}
            </button>
            {isCollapsed && hoveredTab === 'help' && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1d1d1f',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 9px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Ajuda & Suporte
              </div>
            )}
          </div>

          {/* User Profile Avatar / Switcher */}
          <div style={{ position: 'relative', marginTop: '2px' }}>
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              onMouseEnter={() => setHoveredTab('profile')}
              onMouseLeave={() => setHoveredTab(null)}
              title={activeUser?.name || 'Perfil'}
              aria-label="Perfil de usuário e workspace"
              style={{
                width: isCollapsed ? '48px' : '100%',
                height: isCollapsed ? '44px' : '44px',
                borderRadius: '10px',
                border: 'none',
                background: isAccountMenuOpen ? 'rgba(128, 128, 128, 0.12)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? 0 : '0 8px',
                cursor: 'pointer',
                transition: 'background 150ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {/* Circular Avatar with Initials */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: activeTheme.bg,
                    border: `1.5px solid ${activeTheme.border}`,
                    color: activeTheme.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '12px',
                    flexShrink: 0
                  }}
                >
                  {userInitials}
                </div>

                {!isCollapsed && (
                  <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text, #f5f5f7)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {activeUser?.name || 'Usuário'}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-3, #86868b)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {activeUser?.role || 'Lumeo'}
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <ChevronDown
                  size={14}
                  color="var(--text-3, #86868b)"
                  style={{
                    transform: isAccountMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 200ms ease'
                  }}
                />
              )}
            </button>

            {isCollapsed && hoveredTab === 'profile' && !isAccountMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1d1d1f',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 9px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {activeUser?.name || 'Perfil'}
              </div>
            )}
          </div>
        </div>

        {/* ── ACCOUNT POPOVER MODAL ── */}
        {isAccountMenuOpen && (
          <>
            <div
              onClick={() => setIsAccountMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            />
            <div
              style={{
                position: 'fixed',
                bottom: '16px',
                left: isCollapsed ? '72px' : '248px',
                width: '280px',
                background: 'var(--surface, #1c1c1e)',
                border: '1px solid var(--line, rgba(255,255,255,0.12))',
                borderRadius: '16px',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
                zIndex: 9999,
                overflow: 'hidden',
                animation: 'popIn 180ms cubic-bezier(0.32, 0.72, 0, 1)'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text, #f5f5f7)' }}>Lumeo Workspace</span>
              </div>

              {/* Active user details */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3, #86868b)', fontWeight: 600, marginBottom: '8px' }}>
                  Conta Conectada
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: activeTheme.bg,
                      border: `1.5px solid ${activeTheme.border}`,
                      color: activeTheme.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {userInitials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text, #f5f5f7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeUser?.name || 'Usuário'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2, #86868b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeUser?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other saved accounts */}
              {otherAccounts.length > 0 && (
                <div style={{ padding: '8px', borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-3, #86868b)', fontWeight: 600, padding: '4px 8px' }}>
                    Alternar Conta
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
                          padding: '8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: accTheme.bg,
                              color: accTheme.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            {(acc.user.name || 'U')[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text, #f5f5f7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {acc.user.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.user.email)}
                          title="Remover"
                          style={{ background: 'none', border: 'none', color: 'var(--text-3, #86868b)', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action buttons */}
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
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--accent, #0071e3)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={16} strokeWidth={1.75} />
                  <span>Adicionar outra conta</span>
                </button>

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
                      gap: '10px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--danger, #ff3b30)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    <span>Sair da conta</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── MOBILE TAB BAR (<768px: Translucent bottom navigation bar) ── */}
      <nav
        className="lumeo-mobile-tabbar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--surface-glass, rgba(17, 18, 22, 0.9))',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderTop: '1px solid var(--line, rgba(255, 255, 255, 0.1))',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 990,
          padding: '0 8px'
        }}
      >
        {mainNavItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent, #0071e3)' : 'var(--text-2, #86868b)',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500, lineHeight: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── MODAL: CONVIDAR MEMBRO ── */}
      {isInviteModalOpen && (
        <div
          onClick={() => setIsInviteModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--surface, #1c1c1e)',
              borderRadius: '20px',
              border: '1px solid var(--line, rgba(255,255,255,0.12))',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text, #f5f5f7)' }}>
                Convidar membro para o Lumeo
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-2, #86868b)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(52, 199, 89, 0.12)',
                  color: 'var(--ok, #34c759)',
                  fontSize: '13px',
                  textAlign: 'center',
                  fontWeight: 500
                }}
              >
                Convite enviado com sucesso!
              </div>
            ) : (
              <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2, #86868b)', marginBottom: '6px' }}>
                    E-mail do novo membro
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colega@suaempresa.com"
                    style={{
                      width: '100%',
                      height: '42px',
                      borderRadius: '10px',
                      border: '1px solid var(--line, rgba(255,255,255,0.12))',
                      background: 'var(--surface-2, #2c2c2e)',
                      color: 'var(--text, #f5f5f7)',
                      padding: '0 12px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '10px',
                      background: 'rgba(128, 128, 128, 0.12)',
                      border: 'none',
                      color: 'var(--text, #f5f5f7)',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      height: '38px',
                      padding: '0 18px',
                      borderRadius: '10px',
                      background: 'var(--accent, #0071e3)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Enviar Convite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: CONECTAR OUTRA CONTA ── */}
      {isAddAccountModalOpen && (
        <div
          onClick={() => setIsAddAccountModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--surface, #1c1c1e)',
              borderRadius: '20px',
              border: '1px solid var(--line, rgba(255,255,255,0.12))',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text, #f5f5f7)' }}>
                Conectar outra conta
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-2, #86868b)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 59, 48, 0.12)',
                  border: '1px solid rgba(255, 59, 48, 0.25)',
                  color: 'var(--danger, #ff3b30)',
                  fontSize: '12px',
                  marginBottom: '14px'
                }}
              >
                {addError}
              </div>
            )}

            <form onSubmit={handleAddAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2, #86868b)', marginBottom: '6px' }}>
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid var(--line, rgba(255,255,255,0.12))',
                    background: 'var(--surface-2, #2c2c2e)',
                    color: 'var(--text, #f5f5f7)',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-2, #86868b)', marginBottom: '6px' }}>
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Sua senha"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid var(--line, rgba(255,255,255,0.12))',
                    background: 'var(--surface-2, #2c2c2e)',
                    color: 'var(--text, #f5f5f7)',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: 'rgba(128, 128, 128, 0.12)',
                    border: 'none',
                    color: 'var(--text, #f5f5f7)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  disabled={addLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    borderRadius: '10px',
                    background: 'var(--accent, #0071e3)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  disabled={addLoading || !addEmail || !addPassword}
                >
                  {addLoading ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
