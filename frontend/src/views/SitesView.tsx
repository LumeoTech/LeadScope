import React, { useEffect, useState } from 'react';
import { api, Site, SiteEmailTemplate } from '../services/api';
import { Globe, Mail, Plus, Trash2, Edit3, Copy, Check, ExternalLink, Code2, AlertCircle, ArrowLeft, X } from 'lucide-react';

export const SitesView: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [templates, setTemplates] = useState<SiteEmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Modais
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteForm, setSiteForm] = useState({ name: '', url: '', slug: '', webhookUrl: '', active: true });

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

  useEffect(() => {
    loadSites();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await api.sites.list();
      setSites(data || []);
    } catch (e: any) {
      showFeedback('Erro ao carregar sites: ' + (e.message || 'Falha de conexão'), 'error');
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
      showFeedback('Erro ao carregar templates: ' + (e.message || 'Erro'), 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

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
      if (editingSite) {
        await api.sites.update(editingSite.id, siteForm);
        showFeedback('Site atualizado com sucesso!');
      } else {
        await api.sites.create(siteForm);
        showFeedback('Novo site cadastrado com sucesso!');
      }
      setIsSiteModalOpen(false);
      loadSites();
    } catch (e: any) {
      showFeedback('Erro ao salvar site: ' + (e.message || 'Erro desconhecido'), 'error');
    }
  };

  const handleDeleteSite = async (id: number, name: string) => {
    if (!window.confirm(`Deseja realmente remover o site "${name}" e todos os seus templates?`)) return;
    try {
      await api.sites.delete(id);
      showFeedback('Site excluído com sucesso!');
      if (selectedSite?.id === id) {
        setSelectedSite(null);
      }
      loadSites();
    } catch (e: any) {
      showFeedback('Erro ao excluir site: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
    loadTemplates(site.id);
  };

  const handleOpenTemplateModal = (tpl?: SiteEmailTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
      setTemplateForm({
        name: tpl.name,
        triggerEvent: tpl.triggerEvent || 'LEAD_CAPTURED',
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        active: tpl.active,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        triggerEvent: 'LEAD_CAPTURED',
        subject: '',
        bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Recebemos seu contato com sucesso através do nosso portal {{site_name}}.</p><p>Em breve um de nossos consultores entrará em contato.</p>',
        active: true,
      });
    }
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    try {
      if (editingTemplate) {
        await api.sites.updateTemplate(selectedSite.id, editingTemplate.id, templateForm);
        showFeedback('Template atualizado com sucesso!');
      } else {
        await api.sites.createTemplate(selectedSite.id, templateForm);
        showFeedback('Template criado com sucesso!');
      }
      setIsTemplateModalOpen(false);
      loadTemplates(selectedSite.id);
    } catch (e: any) {
      showFeedback('Erro ao salvar template: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!selectedSite) return;
    if (!window.confirm('Deseja excluir este template de email?')) return;
    try {
      await api.sites.deleteTemplate(selectedSite.id, templateId);
      showFeedback('Template removido com sucesso!');
      loadTemplates(selectedSite.id);
    } catch (e: any) {
      showFeedback('Erro ao excluir template: ' + (e.message || 'Erro'), 'error');
    }
  };

  const copyWebhookUrl = (slug: string) => {
    const origin = window.location.origin;
    const url = `${origin}/api/sites/capture/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const insertVariable = (variable: string) => {
    setTemplateForm(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + variable,
    }));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Globe style={{ color: 'var(--primary-color)', width: '28px', height: '28px' }} />
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Sites & Templates por Site</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Conecte seus websites, endpoints de captura de leads e configure respostas de e-mail automáticas e personalizadas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedSite ? (
            <button onClick={() => setSelectedSite(null)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} />
              <span>Voltar aos Sites</span>
            </button>
          ) : (
            <button onClick={() => handleOpenSiteModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} />
              <span>Cadastrar Site</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          {statusMessage.text}
        </div>
      )}

      {/* Main View: Sites List OR Selected Site Templates */}
      {!selectedSite ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Carregando sites cadastrados...
            </div>
          ) : sites.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '60px 30px',
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.02)',
              maxWidth: '680px',
              margin: '30px auto'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Globe size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px', color: '#ffffff' }}>
                Conecte seus Sites & Formulários
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 28px auto', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Cadastre suas landing pages ou websites para receber leads automaticamente no CRM via Webhook, com disparos de email de boas-vindas programados.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Webhook Automático
                </span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Respostas em Tempo Real
                </span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Enriquecimento Automático
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSiteModal()}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              >
                <Plus size={18} />
                <span>Cadastrar Primeiro Site</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {sites.map(site => (
                <div
                  key={site.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-subtle)',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#60a5fa',
                          }}
                        >
                          <Globe size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>{site.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>slug: /{site.slug}</span>
                        </div>
                      </div>
                      <span className={`badge ${site.active ? 'badge-success' : 'badge-danger'}`}>
                        {site.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {site.url && (
                      <a
                        href={site.url.startsWith('http') ? site.url : `https://${site.url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '16px',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} />
                        {site.url}
                      </a>
                    )}

                    {/* Webhook Box */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Endpoint Webhook de Captura
                        </span>
                        <button
                          onClick={() => copyWebhookUrl(site.slug)}
                          className="btn-ghost"
                          style={{ padding: '2px 6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          {copiedSlug === site.slug ? (
                            <>
                              <Check size={12} color="#4ade80" /> <span style={{ color: '#4ade80' }}>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copiar URL
                            </>
                          )}
                        </button>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#93c5fd', wordBreak: 'break-all' }}>
                        POST /api/sites/capture/{site.slug}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenSiteModal(site)}
                        className="btn-ghost"
                        style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-secondary)' }}
                        title="Editar Site"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSite(site.id, site.name)}
                        className="btn-ghost"
                        style={{ padding: '6px', borderRadius: '6px', color: '#ef4444' }}
                        title="Excluir Site"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleSelectSite(site)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                    >
                      <Mail size={16} />
                      <span>Templates de Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detalhe do Site Selecionado & Seus Templates */
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Templates para: {selectedSite.name}</h2>
                <span className={`badge ${selectedSite.active ? 'badge-success' : 'badge-danger'}`}>
                  {selectedSite.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Emails disparados automaticamente quando um lead é capturado via webhook deste site.
              </p>
            </div>

            <button onClick={() => handleOpenTemplateModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} />
              <span>Novo Template</span>
            </button>
          </div>

          {loadingTemplates ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Carregando templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Mail size={44} style={{ color: 'var(--text-muted)', marginBottom: '14px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Nenhum template configurado para este site</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px auto', fontSize: '0.88rem' }}>
                Crie um template para que todo lead capturado neste site receba uma resposta de email automática instantânea.
              </p>
              <button onClick={() => handleOpenTemplateModal()} className="btn btn-primary">
                Criar Primeiro Template
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{tpl.name}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: '600' }}>Gatilho: {tpl.triggerEvent}</span>
                      </div>
                      <span className={`badge ${tpl.active ? 'badge-success' : 'badge-danger'}`}>
                        {tpl.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Assunto:</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {tpl.subject}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Preview HTML:</span>
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          maxHeight: '110px',
                          overflowY: 'auto',
                          marginTop: '4px',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                        dangerouslySetInnerHTML={{ __html: tpl.bodyHtml }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => handleOpenTemplateModal(tpl)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Edit3 size={15} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="btn btn-danger btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Trash2 size={15} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Site */}
      {isSiteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#16181d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            padding: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Globe size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  {editingSite ? 'Editar Site' : 'Cadastrar Novo Site'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSiteModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSite}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Nome do Site / Portal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Landing Page Imóveis SP"
                  value={siteForm.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setSiteForm(prev => ({ ...prev, name, slug: editingSite ? prev.slug : slug }));
                  }}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  URL do Website
                </label>
                <input
                  type="text"
                  placeholder="https://exemplo.com.br"
                  value={siteForm.url}
                  onChange={e => setSiteForm({ ...siteForm, url: e.target.value })}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Slug de Captura (Identificador único na URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="landing-sp"
                  value={siteForm.slug}
                  onChange={e => setSiteForm({ ...siteForm, slug: e.target.value })}
                  className="input"
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
              </div>

              {/* Webhook Preview Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '18px'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#8c93a0', display: 'block', marginBottom: '4px' }}>
                  Endpoint de Webhook Gerado:
                </span>
                <code style={{ fontSize: '0.78rem', color: '#10b981', wordBreak: 'break-all' }}>
                  {window.location.origin}/api/sites/capture/{siteForm.slug || 'slug-do-site'}
                </code>
              </div>

              <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="siteActive"
                  checked={siteForm.active}
                  onChange={e => setSiteForm({ ...siteForm, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-coral)' }}
                />
                <label htmlFor="siteActive" style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#f3f4f6' }}>
                  Site Ativo para recebimento de leads
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsSiteModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSite ? 'Salvar Alterações' : 'Cadastrar Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Template */}
      {isTemplateModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', padding: '28px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px' }}>
              {editingTemplate ? 'Editar Template de Email' : 'Novo Template de Email'}
            </h3>
            <form onSubmit={handleSaveTemplate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Nome Interno do Template
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Boas-vindas Lead Novo"
                    value={templateForm.name}
                    onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Evento Disparador (Trigger)
                  </label>
                  <select
                    value={templateForm.triggerEvent}
                    onChange={e => setTemplateForm({ ...templateForm, triggerEvent: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="LEAD_CAPTURED">Lead Capturado no Site</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Assunto do Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="Olá {{lead_name}}, recebemos sua solicitação!"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Variáveis dinâmicas para inserção rápida */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Tags Dinâmicas (clique para inserir no corpo):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['{{lead_name}}', '{{company_name}}', '{{site_name}}', '{{phone}}', '{{email}}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable(tag)}
                      className="btn-ghost"
                      style={{
                        padding: '3px 8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        fontSize: '0.78rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Corpo do Email (HTML)
                </label>
                <textarea
                  rows={8}
                  required
                  value={templateForm.bodyHtml}
                  onChange={e => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="tplActive"
                  checked={templateForm.active}
                  onChange={e => setTemplateForm({ ...templateForm, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="tplActive" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Ativar envio automático deste template
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? 'Salvar Template' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
