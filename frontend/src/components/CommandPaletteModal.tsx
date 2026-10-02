import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Kanban,
  ScanSearch,
  Building2,
  FileCheck2,
  CalendarDays,
  ShieldCheck,
  Users,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHelp?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenHelp,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: { label: string; description?: string; tab?: ActiveTab; action?: () => void; icon: React.ElementType; category: string }[] = [
    { label: 'Dashboard', description: 'Visão geral e KPIs', tab: 'dashboard', icon: LayoutDashboard, category: 'Principal' },
    { label: 'Leads', description: 'Funil Kanban e tabela', tab: 'kanban', icon: Kanban, category: 'Principal' },
    { label: 'Prospecção', description: 'Scanner B2B de leads', tab: 'scanner', icon: ScanSearch, category: 'Principal' },
    { label: 'Clientes', description: 'Empresas e contatos', tab: 'companies', icon: Building2, category: 'Principal' },
    { label: 'Agenda', description: 'Reuniões e atividades', tab: 'agenda', icon: CalendarDays, category: 'Principal' },
    { label: 'Propostas', description: 'Propostas comerciais', tab: 'proposals', icon: FileCheck2, category: 'Vendas' },
    { label: 'Equipe', description: 'Usuários e permissões', tab: 'users', icon: Users, category: 'Administração' },
    { label: 'Auditoria', description: 'Logs do sistema', tab: 'audit', icon: ShieldCheck, category: 'Administração' },
    {
      label: 'Suporte',
      description: 'Central de ajuda',
      action: () => { onClose(); if (onOpenHelp) onOpenHelp(); },
      icon: HelpCircle,
      category: 'Ajuda'
    },
  ];

  const filteredItems = query.trim()
    ? items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Group by category
  const grouped = filteredItems.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: '80px' }}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '0', borderRadius: '16px', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Paleta de comandos"
        aria-modal="true"
      >
        {/* Search header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            autoFocus
            type="search"
            placeholder="Buscar telas e ações..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', fontSize: '0.92rem', color: 'var(--text-primary)'
            }}
            aria-label="Pesquisa de comandos"
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <kbd style={{ background: 'var(--bg-surface-2)', padding: '2px 6px', borderRadius: '5px', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', border: '1px solid var(--border-subtle)' }}>ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Nenhum resultado para "<strong>{query}</strong>"
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category} style={{ marginBottom: '8px' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-muted)', padding: '4px 8px 6px'
                }}>
                  {category}
                </div>
                {categoryItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (item.tab) { onSelectTab(item.tab); onClose(); }
                        else if (item.action) item.action();
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 10px', borderRadius: '9px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        color: 'var(--text-primary)', textAlign: 'left',
                        width: '100%', transition: 'background 0.12s ease',
                        gap: '10px', minHeight: '44px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          background: 'var(--accent-subtle)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <Icon size={15} color="var(--accent)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.label}</div>
                          {item.description && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: '16px', alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{ background: 'var(--bg-surface-2)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-sans)', border: '1px solid var(--border-subtle)' }}>↑↓</kbd>
            navegar
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={{ background: 'var(--bg-surface-2)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-sans)', border: '1px solid var(--border-subtle)' }}>↵</kbd>
            abrir
          </span>
        </div>
      </div>
    </div>
  );
};
