import React, { useState, useEffect } from 'react';
import { api, Agreement } from '../services/api';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
  Hash,
  Globe,
  DollarSign,
  Building
} from 'lucide-react';

interface PublicAgreementViewProps {
  token: string;
}

export const PublicAgreementView: React.FC<PublicAgreementViewProps> = ({ token }) => {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAgreement = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.agreements.getByToken(token);
        setAgreement(data);
      } catch (err: any) {
        setError(err.message || 'Acordo não encontrado ou link inválido.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAgreement();
    }
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      setError('Por favor, informe seu nome completo para assinar.');
      return;
    }
    if (!acceptedTerms) {
      setError('Você deve marcar a caixa concordando com os termos.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await api.agreements.accept(token, { fullName: signerName.trim(), signerName: signerName.trim() });
      setAgreement(updated);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar aceite digital.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#fff',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="spin" style={{ width: '36px', height: '36px', border: '3px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Carregando acordo comercial seguro...</p>
      </div>
    );
  }

  if (error && !agreement) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        padding: '20px'
      }}>
        <div style={{
          background: '#1e293b',
          padding: '36px',
          borderRadius: '16px',
          maxWidth: '480px',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>Acordo Não Encontrado</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!agreement) return null;

  const isAlreadyAccepted = agreement.status === 'ACCEPTED' || success;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0d14',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#e2e8f0'
    }}>
      <div style={{
        maxWidth: '840px',
        margin: '0 auto',
        background: '#131826',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <div style={{
          padding: '24px 32px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #172554 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
            }}>
              <FileText size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Instrumento Jurídico Digital
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                {agreement.title}
              </h1>
            </div>
          </div>

          <div>
            {isAlreadyAccepted ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}>
                <ShieldCheck size={16} />
                ACEITO DIGITALMENTE
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}>
                <Clock size={16} />
                AGUARDANDO ASSINATURA
              </span>
            )}
          </div>
        </div>

        {/* Metadata Summary Banner */}
        <div style={{
          padding: '18px 32px',
          background: '#0f1422',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} />
              <span>CLIENTE / CONTRATANTE</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '600', color: '#f1f5f9', marginTop: '2px' }}>
              {agreement.clientName || 'Cliente Identificado'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={14} />
              <span>VALOR DO ACORDO</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
              {agreement.value ? Number(agreement.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'A combinar'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>DATA DE EMISSÃO</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: '500', color: '#f1f5f9', marginTop: '2px' }}>
              {new Date(agreement.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Contract Text Body */}
        <div style={{ padding: '32px' }}>
          <div style={{
            background: '#0b0f19',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            fontSize: '0.88rem',
            lineHeight: '1.7',
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap',
            maxHeight: '440px',
            overflowY: 'auto',
            fontFamily: 'monospace'
          }}>
            {agreement.termContent || agreement.terms}
          </div>

          {/* If already accepted, show proof certificate */}
          {isAlreadyAccepted ? (
            <div style={{
              marginTop: '28px',
              padding: '24px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#34d399' }}>
                  Comprovante de Aceite Eletrônico
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>SIGNATÁRIO</div>
                  <div style={{ fontWeight: '600', color: '#f1f5f9', marginTop: '2px' }}>
                    {agreement.acceptedByName || signerName}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>DATA E HORA DO ACEITE</div>
                  <div style={{ fontWeight: '600', color: '#f1f5f9', marginTop: '2px' }}>
                    {agreement.acceptedAt ? new Date(agreement.acceptedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>ENDEREÇO IP REGISTRADO</div>
                  <div style={{ fontWeight: '500', color: '#cbd5e1', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={13} />
                    <span>{agreement.ipAddress || agreement.acceptedIp || 'IP Coletado'}</span>
                  </div>
                </div>
              </div>

              {(agreement.contentSha256 || agreement.acceptedHash) && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={12} />
                    <span>HASH CRIPTOGRÁFICO DE AUTENTICIDADE (SHA-256):</span>
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#a7f3d0',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginTop: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {agreement.contentSha256 || agreement.acceptedHash}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '14px', fontSize: '0.76rem', color: '#94a3b8' }}>
                Validade jurídica conferida nos termos do art. 10, § 2º da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020.
              </div>
            </div>
          ) : (
            /* Pending acceptance form */
            <form onSubmit={handleAccept} style={{
              marginTop: '28px',
              padding: '24px',
              background: '#0f1422',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Lock size={18} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                  Assinatura e Aceite Digital
                </h3>
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.84rem',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                  Nome Completo do Signatário / Representante Legal *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Digite seu nome completo para assinar"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#1e2538',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  color: '#cbd5e1',
                  lineHeight: '1.4'
                }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#7c3aed' }}
                  />
                  <span>
                    Declaro que li, compreendi e concordo integralmente com os termos e condições deste acordo comercial, conferindo validade jurídica à assinatura eletrônica.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Seu IP, data/hora e identificação do navegador serão registrados para fins de autenticação jurídica.
                </div>

                <button
                  type="submit"
                  disabled={submitting || !signerName.trim() || !acceptedTerms}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    cursor: submitting || !signerName.trim() || !acceptedTerms ? 'not-allowed' : 'pointer',
                    opacity: submitting || !signerName.trim() || !acceptedTerms ? 0.6 : 1,
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>{submitting ? 'Processando Aceite...' : 'Confirmar Aceite Digital'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
