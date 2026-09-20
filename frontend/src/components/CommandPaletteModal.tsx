import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Kanban,
  Radar,
  Building2,
  FileCheck2,
  Calendar,
  ShieldAlert,
  Users,
  Sun,
  Moon,
  Rocket,
  Target,
  HelpCircle,
  X,
  ArrowRight,
  Globe,
  Mail
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHelp?: () => void;
  onOpenUpgrade?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenHelp,
  onOpenUpgrade
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: { label: string; tab?: ActiveTab; action?: () => void; icon: any; category: string }[] = [
    { label: 'Dashboard Comercial', tab: 'dashboard', icon: LayoutDashboard, category: 'Navegação' },
    { label: 'Funil de Leads (Kanban / Tabela)', tab: 'kanban', icon: Kanban, category: 'Navegação' },
    { label: 'Scanner B2B de Leads', tab: 'scanner', icon: Radar, category: 'Navegação' },
    { label: 'Empresas & Clientes', tab: 'companies', icon: Building2, category: 'Navegação' },
    { label: 'Propostas Comerciais', tab: 'proposals', icon: FileCheck2, category: 'Navegação' },
    { label: 'Agenda & Reuniões', tab: 'agenda', icon: Calendar, category: 'Navegação' },
    { label: 'Campanhas de Prospecção', tab: 'campaigns', icon: Rocket, category: 'Workspace' },
    { label: 'Metas Comerciais', tab: 'goals', icon: Target, category: 'Workspace' },
    { label: 'Sites & Portais', tab: 'sites', icon: Globe, category: 'Conteúdo' },
    { label: 'Templates de E-mail', tab: 'templates', icon: Mail, category: 'Conteúdo' },
    { label: 'Gestão de Usuários', tab: 'users', icon: Users, category: 'Administração' },
    { label: 'Auditoria de Sistema', tab: 'audit', icon: ShieldAlert, category: 'Administração' },
    {
      label: 'Central de Ajuda & Tutoriais',
      action: () => {
        onClose();
        if (onOpenHelp) onOpenHelp();
      },
      icon: HelpCircle,
      category: 'Ajuda'
    },
    {
      label: 'Ver Licença / Upgrade',
      action: () => {
        onClose();
        if (onOpenUpgrade) onOpenUpgrade();
      },
      icon: Rocket,
      category: 'Conta'
    }
  ];

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '100px' }}>
      <div
        className="modal-content"
        style={{ maxWidth: '540px', width: '100%', padding: '12px', borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            autoFocus
            type="text"
            placeholder="Digite para buscar telas ou ações no CRM..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-primary)'
            }}
          />
          <kbd style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            filteredItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (item.tab) {
                      onSelectTab(item.tab);
                      onClose();
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color="var(--accent-coral)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.label}</span>
                  </div>

                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
