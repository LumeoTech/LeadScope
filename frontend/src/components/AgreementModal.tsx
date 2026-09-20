import React, { useState, useEffect } from 'react';
import { api, Agreement, Company, Lead } from '../services/api';
import {
  FileText,
  X,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  Clock,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  client?: Company | null;
  onAgreementCreated?: (agreement: Agreement) => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  onClose,
  lead,
  client,
  onAgreementCreated
}) => {
  const [title, setTitle] = useState('Acordo Comercial de Prestação de Serviços');
  const [value, setValue] = useState(2500);
  const [terms, setTerms] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState<Agreement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = client?.razaoSocial || lead?.companyRazaoSocial || lead?.companyName || 'Cliente';
  const resolvedEmail = client?.email || lead?.companyEmail || '';

  useEffect(() => {
    if (isOpen) {
      setClientEmail(resolvedEmail);
      setGeneratedAgreement(null);
      setCopied(false);
      setError(null);

      const defaultTemplate = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS E ACORDO COMERCIAL

1. PARTES CONTRATANTES
CONTRATADA: Plataforma CRM & Scanner B2B Soluções Digitais Ltda.
CONTRATANTE: ${clientName} ${resolvedEmail ? `(${resolvedEmail})` : ''}

2. OBJETO DO ACORDO
O presente acordo formaliza a contratação de serviços de consultoria, prospecção e estruturação comercial de leads B2B qualificados.

3. VALOR E CONDIÇÕES DE PAGAMENTO
Pela prestação dos serviços objeto deste instrumento, a CONTRATANTE pagará à CONTRATADA o valor total acordado, conforme condições comerciais alinhadas entre as partes.

4. CONFIDENCIALIDADE E PROTEÇÃO DE DADOS
As partes comprometem-se a manter total sigilo sobre dados, estratégias e informações comerciais compartilhadas, nos termos da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

5. VALIDADE JURÍDICA DO ACEITE ELETRÔNICO
As partes reconhecem a plena validade jurídica do aceite por meio digital deste instrumento, com registro de endereço IP, carimbo de data/hora oficial e hash criptográfico comprobatório, nos termos da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020.`;

      setTerms(defaultTemplate);
    }
  }, [isOpen, clientName, resolvedEmail]);

  if (!isOpen) return null;

  const handleCreateAgreement = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        clientId: client?.id,
        leadId: lead?.id,
        title,
        value: Number(value),
        terms,
        termContent: terms,
        clientEmail: clientEmail || undefined
      };

      const agreement = await api.agreements.create(payload);
      setGeneratedAgreement(agreement);
      if (onAgreementCreated) {
        onAgreementCreated(agreement);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar acordo comercial.');
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (token: string) => {
    return `${window.location.origin}/aceite/${token}`;
  };

  const handleCopyLink = (token: string) => {
    const url = getPublicUrl(token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = (token: string) => {
    const url = getPublicUrl(token);
    const text = encodeURIComponent(
      `Olá! Segue o link para conferência e aceite digital do nosso Acordo Comercial (${title}):\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(124, 58, 237, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {generatedAgreement ? 'Acordo Comercial Gerado' : 'Gerar Acordo Comercial'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {clientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form or Result */}
        {!generatedAgreement ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Título do Acordo
              </label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Prestação de Serviços de Marketing e Vendas"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Valor (R$)
                </label>
                <input
                  type="number"
                  className="input"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  placeholder="2500"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  className="input"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@empresa.com"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Termos e Cláusulas Contratuais
              </label>
              <textarea
                className="input"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.5', resize: 'vertical' }}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateAgreement}
                disabled={loading || !title || !terms}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>{loading ? 'Gerando...' : 'Gerar Acordo & Link de Aceite'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Agreement Created Success View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={28} color="#10b981" />
              <div>
                <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.95rem' }}>
                  Acordo Comercial Criado com Sucesso!
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Envie o link abaixo para o cliente assinar digitalmente com validade jurídica.
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Link Público para Aceite Digital:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  className="input"
                  value={getPublicUrl(generatedAgreement.token)}
                  style={{ background: 'var(--bg-primary)', fontWeight: '500' }}
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(generatedAgreement.token)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status Atual</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: generatedAgreement.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: generatedAgreement.status === 'ACCEPTED' ? '#10b981' : '#f59e0b'
                  }}>
                    {generatedAgreement.status === 'ACCEPTED' ? <Check size={12} /> : <Clock size={12} />}
                    {generatedAgreement.status === 'ACCEPTED' ? 'Aceito' : '⏳ Pendente de Aceite'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(generatedAgreement.token)}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#25D366',
                    borderColor: '#25D366',
                    color: '#ffffff'
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Enviar via WhatsApp</span>
                </button>

                <a
                  href={getPublicUrl(generatedAgreement.token)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  <span>Abrir Tela de Aceite</span>
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
