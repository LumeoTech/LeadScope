import React from 'react';
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
  Globe
} from 'lucide-react';

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
  | 'sites';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole?: string;
  pendingUsersCount?: number;
  onOpenHelp?: () => void;
  onOpenUpgrade?: () => void;
  onOpenCommandPalette?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  pendingUsersCount = 0,
  onOpenHelp,
  onOpenCommandPalette,
  isCollapsed = false,
  onToggleCollapse
}) => {
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
      {/* 1. Header do Workspace (Efferd LLC / LeadScope) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
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
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                Efferd LLC
              </span>
              <ChevronDown size={13} color="#6e7481" />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          style={getNavItemStyle(activeTab === 'dashboard', isCollapsed)}
          title="Dashboard"
        >
          <LayoutGrid size={16} color={activeTab === 'dashboard' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        {/* Content Calendar / Agenda */}
        <button
          onClick={() => setActiveTab('agenda')}
          style={getNavItemStyle(activeTab === 'agenda', isCollapsed)}
          title="Content Calendar"
        >
          <Calendar size={16} color={activeTab === 'agenda' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Content Calendar</span>}
        </button>

        {/* Campaigns / Oportunidades & Leads */}
        <button
          onClick={() => setActiveTab('kanban')}
          style={getNavItemStyle(activeTab === 'kanban', isCollapsed)}
          title="Campaigns"
        >
          <Flag size={16} color={activeTab === 'kanban' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Campaigns</span>}
        </button>

        {/* Analytics / Scanner */}
        <button
          onClick={() => setActiveTab('scanner')}
          style={getNavItemStyle(activeTab === 'scanner', isCollapsed)}
          title="Analytics"
        >
          <BarChart2 size={16} color={activeTab === 'scanner' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Analytics</span>}
        </button>

        {/* Team / Equipe */}
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

        {/* Integrations / Empresas & Parcerias */}
        <button
          onClick={() => setActiveTab('companies')}
          style={getNavItemStyle(activeTab === 'companies', isCollapsed)}
          title="Integrations"
        >
          <Share2 size={16} color={activeTab === 'companies' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Integrations</span>}
        </button>

        {/* Sites & Templates */}
        <button
          onClick={() => setActiveTab('sites')}
          style={getNavItemStyle(activeTab === 'sites', isCollapsed)}
          title="Sites & Templates"
        >
          <Globe size={16} color={activeTab === 'sites' ? '#ffffff' : '#8c93a0'} />
          {!isCollapsed && <span>Sites & Templates</span>}
        </button>
      </div>

      {/* 4. FOOTER / SUPPORT & SETTINGS */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
