import React from 'react';
import { LumeoLogo } from './LumeoLogo';
import {
  LayoutDashboard,
  Kanban,
  Radar,
  Building2,
  FileCheck2,
  Calendar,
  ShieldAlert,
  Users,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Rocket,
  ChevronRight,
  HelpCircle,
  FolderDot,
  Target
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
  | 'goals';

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
  onOpenUpgrade,
  onOpenCommandPalette,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <aside
      className="sidebar"
      style={{
        width: isCollapsed ? '72px' : '240px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden'
      }}
    >
      {/* 1. Header do Workspace (Lumeo Tech) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <LumeoLogo size={26} showText={!isCollapsed} />
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* 2. Campo de Busca no Menu (Atalho ⌘K) */}
      {!isCollapsed ? (
        <div
          onClick={onOpenCommandPalette}
          style={{
            position: 'relative',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
          title="Abrir busca rápida (⌘K)"
        >
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Buscar no sistema (⌘ K)"
            readOnly
            style={{
              width: '100%',
              padding: '6px 36px 6px 30px',
              fontSize: '0.8rem',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '8px',
            top: '7px',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'var(--bg-surface)'
          }}>
            ⌘ K
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Busca rápida (⌘K)"
          style={{
            width: '100%',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <Search size={15} />
        </button>
      )}

      {/* 3. MENU PRINCIPAL */}
      {!isCollapsed && <div className="uxer-sidebar-label">PRINCIPAL</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`uxer-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          title="Dashboard"
        >
          <LayoutDashboard size={16} />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`uxer-nav-item ${activeTab === 'kanban' ? 'active' : ''}`}
          title="Seus Clientes"
        >
          <Kanban size={16} />
          {!isCollapsed && <span style={{ flex: 1 }}>Seus Clientes</span>}
        </button>
      </div>

      {/* 4. FERRAMENTAS COMERCIAIS */}
      {!isCollapsed && <div className="uxer-sidebar-label">OPERAÇÕES</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`uxer-nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
          title="Prospecção"
        >
          <Radar size={16} />
          {!isCollapsed && <span>Prospecção</span>}
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`uxer-nav-item ${activeTab === 'companies' ? 'active' : ''}`}
          title="Empresas"
        >
          <Building2 size={16} />
          {!isCollapsed && <span>Empresas</span>}
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`uxer-nav-item ${activeTab === 'proposals' ? 'active' : ''}`}
          title="Negócios e Propostas"
        >
          <FileCheck2 size={16} />
          {!isCollapsed && <span>Negócios & Propostas</span>}
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`uxer-nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
          title="Agenda & Reuniões"
        >
          <Calendar size={16} />
          {!isCollapsed && <span>Agenda & Reuniões</span>}
        </button>
      </div>

      {/* 5. PLANEJAMENTO */}
      {!isCollapsed && <div className="uxer-sidebar-label">PLANEJAMENTO</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`uxer-nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
          title="Campanhas"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: '#3b82f6', flexShrink: 0 }}></span>
          {!isCollapsed && (
            <>
              <span style={{ flex: 1, fontSize: '0.82rem' }}>Campanhas</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: '8px' }}>
                5
              </span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`uxer-nav-item ${activeTab === 'goals' ? 'active' : ''}`}
          title="Metas Comerciais"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: '#ec4899', flexShrink: 0 }}></span>
          {!isCollapsed && (
            <>
              <span style={{ flex: 1, fontSize: '0.82rem' }}>Metas Comerciais</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: '8px' }}>
                4
              </span>
            </>
          )}
        </button>
      </div>

      {/* 6. ADMIN & CONFIGURAÇÕES */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        {userRole !== 'VENDEDOR' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`uxer-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            title="Usuários"
          >
            <Users size={16} />
            {!isCollapsed && (
              <>
                <span style={{ flex: 1 }}>Usuários</span>
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

        {userRole !== 'VENDEDOR' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`uxer-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            title="Auditoria"
          >
            <ShieldAlert size={16} />
            {!isCollapsed && <span>Auditoria</span>}
          </button>
        )}

        {/* Central de Ajuda Funcional */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="uxer-nav-item"
          title="Central de Ajuda & Documentação"
          style={{ width: '100%', textAlign: 'left' }}
        >
          <HelpCircle size={16} />
          {!isCollapsed && <span>Central de Ajuda</span>}
        </button>

        {/* Card Upgrade & Unlock Funcional */}
        {!isCollapsed ? (
          <div
            onClick={onOpenUpgrade}
            title="Ver licença e plano"
            style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff5722 0%, #f4511e 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Rocket size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Upgrade & unlock
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                all features
              </div>
            </div>
            <ChevronRight size={14} color="var(--accent-coral)" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenUpgrade}
            title="Upgrade & Licença"
            style={{
              width: '100%',
              height: '36px',
              marginTop: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff5722 0%, #f4511e 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Rocket size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};
