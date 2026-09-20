import React from 'react';
import {
  HelpCircle,
  X,
  Radar,
  Kanban,
  FileSignature,
  Users,
  Command,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { LumeoLogo } from './LumeoLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LumeoLogo size={24} showText={false} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Central de Ajuda & Documentação
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                lumeo TECH CRM + Scanner B2B Plataforma
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Scanner B2B */}
          <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Radar size={18} color="var(--accent-coral)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                1. Scanner B2B de Leads
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use a busca por rua, bairro ou coordenadas geográficas para escanear estabelecimentos locais em tempo real. Selecione nichos específicos (saúde, beleza, alimentação, serviços) e converta resultados diretamente em oportunidades no funil ou empresas com um único clique.
            </p>
          </div>

          {/* Section 2: Funil & Tabela */}
          <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Kanban size={18} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                2. Funil de Vendas (Kanban & Table View)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Alterne entre a visão de Tabela (estilo planilha rápida com filtros, ordenação e exportação CSV) e a visão Kanban para arrastar e mover leads entre as etapas comerciais (Novo &rarr; Contato &rarr; Negociação &rarr; Ganho/Fechado).
            </p>
          </div>

          {/* Section 3: Acordos Digitais */}
          <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileSignature size={18} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                3. Acordo Comercial & Aceite Digital
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Gere termos de prestação de serviços com token único criptografado. O link público <code>/aceite/:token</code> permite ao cliente assinar com carimbo de data, IP e User-Agent, convertendo-o automaticamente em Cliente Ativo.
            </p>
          </div>

          {/* Section 4: Atalhos */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Command size={15} />
              <span>Atalhos do Teclado</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Busca rápida</span>
                <kbd style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>⌘ K / Ctrl + K</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fechar janelas</span>
                <kbd style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Suporte técnico: <strong style={{ color: 'var(--text-secondary)' }}>contato@lumeo.tech</strong>
          </span>
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
