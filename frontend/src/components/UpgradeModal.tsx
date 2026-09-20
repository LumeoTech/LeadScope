import React from 'react';
import {
  Rocket,
  X,
  Check,
  Shield,
  Zap,
  Sparkles,
  Award
} from 'lucide-react';
import { LumeoLogo } from './LumeoLogo';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff5722 0%, #f4511e 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Rocket size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Seu Plano & Licença
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Gerenciamento de recursos e capacidade contratada
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

        {/* Current Active Plan Banner */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          border: '1px solid var(--accent-coral)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Plano Pro Enterprise
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                background: '#10b981',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                ATIVO
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Acesso total a todos os módulos, varredura geográfica de leads e contratos digitais.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Ilimitado
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Renovação automática</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {[
            { title: 'Scanner B2B de Leads', desc: 'Varredura por rua, bairro e raio de busca' },
            { title: 'Funil e Gestão de Vendas', desc: 'Kanban ilimitado com filtros rápidos e métricas' },
            { title: 'Assinatura e Termos Digitais', desc: 'Geração de acordos e links públicos com IP' },
            { title: 'Multi-usuários & Auditoria', desc: 'Controle de aprovação de novos administradores' },
            { title: 'Exportação em CSV', desc: 'Download instantâneo de dados de leads e empresas' },
            { title: 'Temas Claro e Escuro', desc: 'Interface moderna adaptada à identidade lumeo TECH' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '8px', background: 'var(--bg-hover)' }}>
              <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
          <button
            type="button"
            onClick={() => {
              alert('Seu ambiente lumeo TECH já está com a licença Pro ativa e liberada!');
              onClose();
            }}
            className="btn btn-primary"
          >
            Gerenciar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
};
