import React, { useState, useEffect } from 'react';
import { api, Contract, Company } from '../services/api';
import { FileSignature, CheckCircle2, Send, ExternalLink, X, Loader2, Sparkles, Building2 } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: {
    id?: number;
    razaoSocial?: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
  } | null;
  proposal?: {
    id: number;
    title: string;
    value: number;
    companyId?: number;
    companyRazaoSocial?: string;
  } | null;
  leadId?: number;
  onContractSent?: (contract: Contract) => void;
}

const TEMPLATES = [
  {
    id: 'servicos_b2b',
    name: 'Contrato de Prestação de Serviços B2B',
    desc: 'Ideal para fechamento de contratos recorrentes e prestação continuada de serviços.',
  },
  {
    id: 'acordo_comercial',
    name: 'Acordo Comercial e Fechamento de Vendas',
    desc: 'Termo de aceite e condições comerciais para fornecimento ou projetos pontuais.',
  },
  {
    id: 'consultoria',
    name: 'Contrato Padrão de Consultoria e Assessoria',
    desc: 'Cláusulas específicas de confidencialidade (NDA), escopo técnico e honorários.',
  }
];

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  company,
  proposal,
  leadId,
  onContractSent
}) => {
  const [templateName, setTemplateName] = useState(TEMPLATES[0].name);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sentContract, setSentContract] = useState<Contract | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (proposal) {
      setRecipientName(proposal.companyRazaoSocial || 'Representante Legal');
      setRecipientEmail('contato@' + (proposal.companyRazaoSocial?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa') + '.com.br');
      setRecipientPhone('(11) 98877-6655');
    } else if (company) {
      setRecipientName(company.razaoSocial || '');
      setRecipientEmail(company.email || 'contato@' + (company.razaoSocial?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa') + '.com.br');
      setRecipientPhone(company.telefone || '(11) 98877-6655');
    }
    setSentContract(null);
    setError(null);
  }, [company, proposal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const selectedTemplate = TEMPLATES.find(t => t.name === templateName);
      const templateType = selectedTemplate?.id?.toUpperCase() || 'SERVICOS_B2B';

      const contract = await api.contracts.send({
        companyId: company?.id || proposal?.companyId,
        leadId: leadId,
        templateName,
        recipientName,
        recipientEmail,
        recipientPhone: recipientPhone || undefined,
        signerName: recipientName,
        signerEmail: recipientEmail,
        signerPhone: recipientPhone || undefined,
        templateType,
        value: proposal?.value,
      });
      setSentContract(contract);
      if (onContractSent) onContractSent(contract);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar contrato via DocuSeal.');
    } finally {
      setSending(false);
    }
  };

  const handleSimulateSign = async () => {
    if (!sentContract) return;
    setSimulating(true);
    try {
      const updated = await api.contracts.simulateSign(sentContract.id);
      setSentContract(updated);
      if (onContractSent) onContractSent(updated);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular assinatura.');
    } finally {
      setSimulating(false);
    }
  };

  const isSigned = sentContract?.status === 'SIGNED' || sentContract?.status === 'COMPLETED';
  const displayEmail = sentContract?.recipientEmail || sentContract?.signerEmail;
  const displayName = sentContract?.recipientName || sentContract?.signerName;
  const displayUrl = sentContract?.documentUrl || sentContract?.signingUrl;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', position: 'relative' }}>
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            right: '18px',
            top: '18px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {sentContract ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: isSigned ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 58, 95, 0.35)',
              border: isSigned ? '2px solid #10b981' : '2px solid #1e3a5f',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={32} color={isSigned ? '#10b981' : '#93c5fd'} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '8px' }}>
              {isSigned ? 'Contrato Assinado com Sucesso!' : 'Contrato Enviado para Assinatura!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px auto' }}>
              {isSigned
                ? 'O cliente assinou digitalmente o contrato e o status no CRM foi atualizado automaticamente.'
                : `O envelope DocuSeal foi disparado para ${displayEmail}.`}
            </p>

            <div style={{
              padding: '16px',
              background: 'var(--bg-surface-elevated, rgba(255,255,255,0.03))',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TEMPLATE:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sentContract.templateName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DESTINATÁRIO:</span>
                <span style={{ fontSize: '0.85rem' }}>{displayName} ({displayEmail})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>STATUS ATUAL:</span>
                <span className={`badge ${isSigned ? 'badge-success' : 'badge-warning'}`}>
                  {isSigned ? 'Assinado' : 'Pendente de Assinatura'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {displayUrl && (
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={15} />
                  <span>Abrir no DocuSeal</span>
                </a>
              )}

              {!isSigned && (
                <button
                  type="button"
                  onClick={handleSimulateSign}
                  disabled={simulating}
                  className="btn btn-success"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Simula a assinatura do cliente pelo webhook DocuSeal"
                >
                  {simulating ? <Loader2 size={15} className="spinner" /> : <Sparkles size={15} />}
                  <span>Simular Assinatura (Webhook)</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(30, 58, 95, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileSignature size={20} color="#93c5fd" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Enviar Contrato Digital</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinatura eletrônica gratuita via DocuSeal API</span>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Seleção de Template */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Modelo do Contrato *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {TEMPLATES.map((tmpl) => (
                    <label
                      key={tmpl.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: templateName === tmpl.name ? 'rgba(30, 58, 95, 0.35)' : 'var(--bg-surface-elevated, rgba(255,255,255,0.02))',
                        border: templateName === tmpl.name ? '1.5px solid #2e558a' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="templateName"
                        checked={templateName === tmpl.name}
                        onChange={() => setTemplateName(tmpl.name)}
                        style={{ marginTop: '3px', accentColor: '#1e3a5f' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{tmpl.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tmpl.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dados do Cliente */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Nome / Razão Social do Cliente *
                </label>
                <input
                  required
                  className="input"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    E-mail do Destinatário *
                  </label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    WhatsApp / Telefone
                  </label>
                  <input
                    className="input"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending || !recipientEmail.trim() || !recipientName.trim()}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {sending ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                  <span>{sending ? 'Disparando envelope...' : 'Enviar Contrato via DocuSeal'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
