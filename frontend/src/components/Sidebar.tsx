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
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  UserPlus,
  LogOut,
  X,
  ScanSearch,
  ShieldCheck
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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const navItem = (
    tab: ActiveTab,
    label: string,
    Icon: React.ElementType,
    badge?: number
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        title={label}
        aria-current={isActive ? 'page' : undefined}
        style={navItemStyle(isActive, isCollapsed)}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        <Icon size={16} style={{ flexShrink: 0 }} />
        {!isCollapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            {badge != null && badge > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '1px 5px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {badge}
              </span>
            )}
          </>
        )}
        {isCollapsed && badge != null && badge > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444'
          }} />
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '232px',
        minWidth: isCollapsed ? '68px' : '232px',
        background: '#0a0b0d',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflowX: 'hidden'
      }}
    >
      {/* Header: Workspace + collapse toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '20px',
        padding: '0 4px'
      }}>
        <div
          onClick={() => setIsAccountMenuOpen(p => !p)}
          title="Conta e workspace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '5px 6px',
            borderRadius: '8px',
            background: isAccountMenuOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
            transition: 'background 0.15s ease',
            minWidth: 0,
            flex: isCollapsed ? undefined : 1
          }}
        >
          {/* Lumeo logo mark */}
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.4)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16"/><path d="M4 12h10"/>
              <circle cx="18" cy="12" r="2.5" fill="white" stroke="none"/>
              <path d="M4 18h14"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Lumeo
              </span>
              <ChevronDown size={12} color="#64748b" style={{ flexShrink: 0, transform: isAccountMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Recolher menu"
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            <ChevronsLeft size={15} />
          </button>
        )}
      </div>

      {/* Search shortcut */}
      {!isCollapsed ? (
        <div
          onClick={onOpenCommandPalette}
          title="Pesquisar (⌘K)"
          style={{ position: 'relative', marginBottom: '20px', cursor: 'pointer' }}
        >
          <Search size={13} color="#475569" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <div style={{
            width: '100%', padding: '7px 36px 7px 30px',
            fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px',
            color: '#64748b', cursor: 'pointer', userSelect: 'none'
          }}>
            Pesquisar...
          </div>
          <span style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.62rem', color: '#475569',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '1px 4px', borderRadius: '4px', background: '#111214'
          }}>⌘K</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Pesquisar (⌘K)"
          style={{
            width: '100%', height: '36px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px', cursor: 'pointer', color: '#475569'
          }}
        >
          <Search size={14} />
        </button>
      )}

      {/* ── MENU PRINCIPAL (5 itens core) ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {!isCollapsed && (
          <p style={{ fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#334155', padding: '0 8px 6px', margin: 0 }}>
            Principal
          </p>
        )}

        {navItem('dashboard', 'Dashboard', LayoutDashboard)}

        {canSeeLeads && navItem('kanban', 'Leads', Kanban)}

        {canSeeAnalytics && navItem('scanner', 'Prospecção', ScanSearch)}

        {canSeeCompanies && navItem('companies', 'Clientes', Building2)}

        {canSeeAgenda && navItem('agenda', 'Agenda', CalendarDays)}

        {/* Separador Admin */}
        {isAdmin && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 4px' }} />
            {!isCollapsed && (
              <p style={{ fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#334155', padding: '0 8px 6px', margin: 0 }}>
                Admin
              </p>
            )}
            {navItem('users', 'Equipe', Users, pendingUsersCount)}
            {navItem('audit', 'Auditoria', ShieldCheck)}
          </>
        )}
      </nav>

      {/* ── FOOTER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <button
          type="button"
          onClick={onOpenHelp}
          title="Suporte"
          style={navItemStyle(false, isCollapsed)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <HelpCircle size={16} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Suporte</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          title="Configurações"
          style={navItemStyle(false, isCollapsed)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Settings size={16} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Configurações</span>}
        </button>

        {/* Expand toggle (collapsed state) */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expandir"
            style={{ ...navItemStyle(false, true), marginTop: '4px' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronsRight size={15} />
          </button>
        )}
      </div>

      {/* ── ACCOUNT MENU POPOVER ── */}
      {isAccountMenuOpen && (
        <>
          <div
            onClick={() => setIsAccountMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: isCollapsed ? '16px' : '60px',
            left: isCollapsed ? '72px' : '12px',
            width: '280px',
            background: '#111316',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
            zIndex: 9999,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f1f5f9' }}>Workspace</span>
            </div>

            {/* Active account */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', fontWeight: '700', marginBottom: '8px' }}>Conta ativa</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: activeTheme.bg, border: `2px solid ${activeTheme.border}`,
                  color: activeTheme.text, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '700', fontSize: '0.82rem', flexShrink: 0
                }}>
                  {(activeUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.84rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeUser?.name || 'Usuário'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeUser?.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: '700', padding: '2px 6px',
                  borderRadius: '4px', background: activeTheme.bg, color: activeTheme.text,
                  textTransform: 'uppercase', flexShrink: 0
                }}>
                  {activeUser?.role || 'User'}
                </span>
              </div>
            </div>

            {/* Other accounts */}
            {otherAccounts.length > 0 && (
              <div style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', fontWeight: '700', padding: '4px 8px', marginBottom: '4px' }}>
                  Alternar conta
                </div>
                {otherAccounts.map((acc) => {
                  const accTheme = getUserTheme(acc.user.id, acc.user.name);
                  return (
                    <div
                      key={acc.user.email}
                      onClick={() => handleSwitchAccount(acc.user.email)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 8px', borderRadius: '8px', cursor: 'pointer', gap: '8px', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: accTheme.bg, border: `1px solid ${accTheme.border}`,
                          color: accTheme.text, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0
                        }}>
                          {(acc.user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.user.name}</div>
                          <div style={{ fontSize: '0.66rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.user.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, acc.user.email)}
                        title="Remover"
                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '3px', borderRadius: '4px', display: 'flex' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '6px' }}>
              <button
                type="button"
                onClick={() => { setIsAccountMenuOpen(false); setIsAddAccountModalOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#60a5fa', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <UserPlus size={14} /><span>Adicionar conta</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => { setIsAccountMenuOpen(false); onLogout(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#f87171', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} /><span>Sair</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── ADD ACCOUNT MODAL ── */}
      {isAddAccountModalOpen && (
        <div
          onClick={() => setIsAddAccountModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '400px', background: '#111316', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.85)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f1f5f9' }}>Conectar outra conta</h3>
              <button type="button" onClick={() => setIsAddAccountModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.8rem', marginBottom: '16px' }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>E-mail *</label>
                <input type="email" required value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@empresa.com" className="input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Senha *</label>
                <input type="password" required value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Sua senha" className="input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setIsAddAccountModalOpen(false)} className="btn btn-secondary" disabled={addLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={addLoading || !addEmail || !addPassword}>
                  {addLoading ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

const navItemStyle = (isActive: boolean, isCollapsed: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: isCollapsed ? 'center' : 'flex-start',
  gap: '10px',
  padding: isCollapsed ? '9px' : '8px 10px',
  borderRadius: '9px',
  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
  color: isActive ? '#f1f5f9' : '#64748b',
  fontSize: '0.82rem',
  fontWeight: isActive ? '600' : '500',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  transition: 'background 0.15s ease, color 0.15s ease',
  position: 'relative',
  minHeight: '36px',
});
