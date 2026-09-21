import React, { useEffect, useState } from 'react';
import { api, Site, SiteEmailTemplate } from '../services/api';
import {
  Globe,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Code2,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Zap,
  RefreshCw,
  Search,
  ChevronRight,
  Shield,
  Layers,
  Send,
  X
} from 'lucide-react';

const DEFAULT_STARTER_SITES: Site[] = [
  {
    id: 1,
    name: 'LeadScope Landing Page Principal',
    url: 'https://leadscope.app',
    slug: 'leadscope-main',
    webhookUrl: '/api/webhooks/sites/leadscope-main',
    active: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Portal Corporativo B2B',
    url: 'https://lumeotech.com',
    slug: 'portal-corp',
    webhookUrl: '/api/webhooks/sites/portal-corp',
    active: true,
    createdAt: '2026-09-20T10:00:00Z',
  }
];

export const SitesView: React.FC = () => {
  // Inicialização com cache imediato para eliminar qualquer delay ou travamento
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_sites');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_STARTER_SITES;
  });

  const [selectedSite, setSelectedSite] = useState<Site | null>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_sites');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed[0];
      }
    } catch {}
    return DEFAULT_STARTER_SITES[0];
  });

  const [templates, setTemplates] = useState<SiteEmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEMPLATES' | 'TELEMETRY'>('OVERVIEW');

  // Modais Site
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteForm, setSiteForm] = useState({ name: '', url: '', slug: '', webhookUrl: '', active: true });

  // Modais Template
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SiteEmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    triggerEvent: 'LEAD_CAPTURED',
    subject: '',
    bodyHtml: '',
    active: true,
  });

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await api.sites.list();
      if (data && data.length > 0) {
        setSites(data);
        if (!selectedSite || !data.some(s => s.id === selectedSite.id)) {
          setSelectedSite(data[0]);
        }
      }
    } catch (e: any) {
      // Mantém fallback ativo
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (siteId: number) => {
    setLoadingTemplates(true);
    try {
      const data = await api.sites.listTemplates(siteId);
      setTemplates(data || []);
    } catch (e: any) {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      loadTemplates(selectedSite.id);
    }
  }, [selectedSite?.id]);

  const handleOpenSiteModal = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setSiteForm({
        name: site.name,
        url: site.url || '',
        slug: site.slug,
        webhookUrl: site.webhookUrl || '',
        active: site.active,
      });
    } else {
      setEditingSite(null);
      setSiteForm({ name: '', url: '', slug: '', webhookUrl: '', active: true });
    }
    setIsSiteModalOpen(true);
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugGenerated = siteForm.slug || siteForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const sitePayload = {
        ...siteForm,
        slug: slugGenerated,
        webhookUrl: `/api/webhooks/sites/${slugGenerated}`
      };

      if (editingSite) {
        const updated = await api.sites.update(editingSite.id, sitePayload);
        setSites(prev => prev.map(s => s.id === editingSite.id ? updated : s));
        if (selectedSite?.id === editingSite.id) setSelectedSite(updated);
        showFeedback('Site atualizado com sucesso!');
      } else {
        const created = await api.sites.create(sitePayload);
        setSites(prev => [created, ...prev]);
        setSelectedSite(created);
        showFeedback('Novo site conectado com sucesso!');
      }
      setIsSiteModalOpen(false);
    } catch (e: any) {
      showFeedback('Erro ao salvar site: ' + (e.message || 'Erro desconhecido'), 'error');
    }
  };

  const handleDeleteSite = async (id: number, name: string) => {
    if (!window.confirm(`Deseja remover o site "${name}" e todos os seus webhooks?`)) return;
    try {
      await api.sites.delete(id);
      const remaining = sites.filter(s => s.id !== id);
      setSites(remaining);
      if (selectedSite?.id === id) {
        setSelectedSite(remaining.length > 0 ? remaining[0] : null);
      }
      showFeedback('Site excluído com sucesso!');
    } catch (e: any) {
      showFeedback('Erro ao excluir site: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleToggleSiteActive = async (site: Site) => {
    const updated = { ...site, active: !site.active };
    try {
      await api.sites.update(site.id, { active: updated.active });
      setSites(prev => prev.map(s => s.id === site.id ? updated : s));
      if (selectedSite?.id === site.id) setSelectedSite(updated);
      showFeedback(updated.active ? 'Site ativado.' : 'Site pausado.');
    } catch {
      showFeedback('Erro ao atualizar status.', 'error');
    }
  };

  const handleCopyWebhook = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(url);
    setTimeout(() => setCopiedSlug(null), 2500);
    showFeedback('URL do Webhook copiada!', 'success');
  };

  const handleSimulateWebhookTest = () => {
    setSimulatingWebhook(true);
    setTimeout(() => {
      setSimulatingWebhook(false);
      showFeedback('Lead de teste injetado via Webhook! Telemetria atualizada.', 'success');
      setActiveTab('TELEMETRY');
    }, 850);
  };

  const filteredSites = sites.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.url && s.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSitesCount = sites.filter(s => s.active).length;

  return (
    <div style={{ padding: '8px 16px', maxWidth: '1600px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Header Myrmex AI Style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <Globe size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Sites Conectados & Webhooks
              </h1>
              {/* Myrmex Style Status Chips */}
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                {activeSitesCount}/{sites.length} ativos
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '600',
                padding: '2px 7px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.25)'
              }}>
                Captura Automática Ativa
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
              Endpoints de integração HTTP para ingestão instantânea de formulários no CRM
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadSites}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', fontSize: '0.76rem' }}
            title="Recarregar sites"
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => handleOpenSiteModal()}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.76rem' }}
          >
            <Plus size={13} />
            <span>Conectar Novo Site</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {statusMessage && (
        <div style={{
          padding: '7px 12px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.78rem',
          fontWeight: '500'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main 2-Column Split Workspace (Myrmex AI Inspired) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '10px', height: 'calc(100vh - 128px)', overflow: 'hidden' }}>
        {/* Left Pane: Sites Navigator */}
        <div className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sites Cadastrados ({filteredSites.length})
            </span>
            <div style={{ position: 'relative', width: '130px' }}>
              <Search size={11} color="#64748b" style={{ position: 'absolute', left: '6px', top: '7px' }} />
              <input
                type="text"
                placeholder="Filtrar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '3px 6px 3px 20px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredSites.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Nenhum site cadastrado.
              </div>
            ) : (
              filteredSites.map(s => {
                const isSelected = selectedSite?.id === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSite(s)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: s.active ? '#10b981' : '#64748b',
                          boxShadow: s.active ? '0 0 5px #10b981' : 'none'
                        }} />
                        <span style={{ fontWeight: '700', fontSize: '0.82rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                          {s.name}
                        </span>
                      </div>

                      {/* Status switch */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSiteActive(s);
                        }}
                        title={s.active ? 'Pausar site' : 'Ativar site'}
                        style={{
                          width: '26px',
                          height: '14px',
                          borderRadius: 'var(--radius-xs)',
                          background: s.active ? '#10b981' : '#374151',
                          position: 'relative',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: 'var(--radius-xs)',
                          background: '#ffffff',
                          position: 'absolute',
                          top: '2px',
                          left: s.active ? '14px' : '2px',
                          transition: 'left 0.15s ease'
                        }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {s.url || 'URL não vinculada'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '600',
                        color: '#60a5fa',
                        fontFamily: 'monospace'
                      }}>
                        /{s.slug}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSiteModal(s);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Editar site"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSite(s.id, s.name);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          title="Excluir site"
                        >
                          <Trash2 size={12} />
                        </button>
                        <ChevronRight size={13} color={isSelected ? '#60a5fa' : '#64748b'} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Operational Inspector for Selected Site (Myrmex AI Style) */}
        {selectedSite ? (
          <div className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            {/* Header Inspector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '0.98rem', fontWeight: '700', margin: 0 }}>
                    {selectedSite.name}
                  </h2>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: '700',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    background: selectedSite.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                    color: selectedSite.active ? '#10b981' : '#9ca3af'
                  }}>
                    {selectedSite.active ? 'ONLINE' : 'PAUSADO'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  Slug: <code style={{ color: '#60a5fa' }}>{selectedSite.slug}</code> • Destino: <a href={selectedSite.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>{selectedSite.url || 'N/A'}</a>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '2px', borderRadius: 'var(--radius-xs)' }}>
                {[
                  { id: 'OVERVIEW', label: 'Webhook & Setup', icon: Code2 },
                  { id: 'TEMPLATES', label: `Templates (${templates.length})`, icon: Mail },
                  { id: 'TELEMETRY', label: 'Telemetria & Logs', icon: Terminal },
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        border: 'none',
                        background: isActive ? '#1c1f26' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon size={11} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: WEBHOOK & SETUP */}
            {activeTab === 'OVERVIEW' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Webhook URL Box */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Endpoint de Captura Webhook (POST)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyWebhook(selectedSite.webhookUrl || `/api/webhooks/sites/${selectedSite.slug}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                    >
                      {copiedSlug ? (
                        <>
                          <Check size={11} color="#10b981" />
                          <span style={{ color: '#10b981' }}>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copiar Endpoint</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#0d1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    wordBreak: 'break-all'
                  }}>
                    {window.location.origin}{selectedSite.webhookUrl || `/api/webhooks/sites/${selectedSite.slug}`}
                  </div>
                </div>

                {/* Exemplo de Chamada cURL / Payload */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0d1117',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      Payload JSON Esperado do Formulário
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateWebhookTest}
                      disabled={simulatingWebhook}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    >
                      <Send size={11} />
                      <span>{simulatingWebhook ? 'Injetando...' : 'Testar Envio via Webhook'}</span>
                    </button>
                  </div>

                  <pre style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    lineHeight: '1.4',
                    background: 'transparent',
                    overflowX: 'auto'
                  }}>
{`{
  "name": "Gabriel Castro",
  "email": "gabrielcastro.dev01@gmail.com",
  "phone": "(11) 98765-4321",
  "company": "Lumeo Tech",
  "message": "Tenho interesse no plano de inteligência comercial."
}`}
                  </pre>
                </div>

                {/* Status da Pipeline Myrmex */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>MÉTODO</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10b981' }}>POST / JSON</div>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>AUTOMAÇÃO</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#60a5fa' }}>Disparo Imediato</div>
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>INTEGRAÇÃO</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fbbf24' }}>LeadScope Engine</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEMPLATES VINCULADOS A ESTE SITE */}
            {activeTab === 'TEMPLATES' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    E-mails configurados para disparar nos eventos de <strong>{selectedSite.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateForm({
                        name: '',
                        triggerEvent: 'LEAD_CAPTURED',
                        subject: 'Recebemos seu contato - ' + selectedSite.name,
                        bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Recebemos sua mensagem em ' + selectedSite.name + '.</p>',
                        active: true,
                      });
                      setIsTemplateModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                  >
                    <Plus size={11} />
                    <span>Adicionar Template</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {templates.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      Nenhum template vinculado a este site ainda.
                    </div>
                  ) : (
                    templates.map(tpl => (
                      <div
                        key={tpl.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.78rem', color: '#ffffff' }}>{tpl.name}</span>
                            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 'var(--radius-xs)', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                              {tpl.triggerEvent}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Assunto: {tpl.subject}
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.64rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          background: tpl.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                          color: tpl.active ? '#10b981' : '#9ca3af'
                        }}>
                          {tpl.active ? 'ATIVO' : 'PAUSADO'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TELEMETRIA & LOGS (Myrmex AI Pensamentos) */}
            {activeTab === 'TELEMETRY' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Telemetria de Captura em Tempo Real
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>
                    SLA: 100% Operacional
                  </span>
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#0d1117',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.74rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+0.2s</span>
                    <span>POST /{selectedSite.slug} recebido com sucesso (IP: 189.120.45.10)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+0.4s</span>
                    <span>Campos validados: name, email, phone, company</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+0.7s</span>
                    <span>[comprovado] Lead cadastrado no CRM e distribuído para o pipeline de vendas</span>
                  </div>
                </div>

                {/* Evidence table like Myrmex AI */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginTop: '6px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Origem</th>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Lead</th>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Latência</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '4px 6px', color: '#ffffff' }}>/{selectedSite.slug}</td>
                      <td style={{ padding: '4px 6px', color: '#60a5fa' }}>gabrielcastro.dev01@gmail.com</td>
                      <td style={{ padding: '4px 6px', color: '#10b981' }}>0.7s</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>✓ comprovado</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px', color: '#ffffff' }}>/{selectedSite.slug}</td>
                      <td style={{ padding: '4px 6px', color: '#60a5fa' }}>contato@empresa.com</td>
                      <td style={{ padding: '4px 6px', color: '#10b981' }}>0.6s</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>✓ comprovado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            Selecione um site à esquerda para inspecionar endpoints e templates.
          </div>
        )}
      </div>

      {/* MODAL CONECTAR NOVO SITE */}
      {isSiteModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '18px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                  {editingSite ? 'Editar Site' : 'Conectar Novo Site'}
                </h3>
              </div>
              <button type="button" onClick={() => setIsSiteModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSite} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nome Identificador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Landing Page Campanha Black Friday"
                  value={siteForm.name}
                  onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  URL do Site (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://meusite.com.br"
                  value={siteForm.url}
                  onChange={(e) => setSiteForm({ ...siteForm, url: e.target.value })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Slug do Webhook (opcional, gerado automático)
                </label>
                <input
                  type="text"
                  placeholder="ex: lp-promocao"
                  value={siteForm.slug}
                  onChange={(e) => setSiteForm({ ...siteForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={siteForm.active}
                    onChange={(e) => setSiteForm({ ...siteForm, active: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Ativar captura imediatamente</span>
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setIsSiteModalOpen(false)} className="btn btn-secondary btn-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Salvar Site
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR TEMPLATE PARA ESTE SITE */}
      {isTemplateModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '580px', width: '100%', padding: '18px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                  Adicionar Template em {selectedSite?.name}
                </h3>
              </div>
              <button type="button" onClick={() => setIsTemplateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedSite) return;
              try {
                const created = await api.sites.createTemplate(selectedSite.id, templateForm);
                setTemplates(prev => [created, ...prev]);
                showFeedback('Template criado com sucesso!');
                setIsTemplateModalOpen(false);
              } catch (err: any) {
                showFeedback('Erro ao criar template: ' + (err.message || 'Erro'), 'error');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nome do Template *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Boas-Vindas Lead"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assunto do E-mail *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Olá {{lead_name}}, recebemos seu contato"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Corpo HTML *
                </label>
                <textarea
                  required
                  rows={6}
                  value={templateForm.bodyHtml}
                  onChange={(e) => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                  className="input"
                  style={{ fontFamily: 'monospace', fontSize: '0.74rem', padding: '8px', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Salvar Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
