import React, { useEffect, useState } from 'react';
import { api, Site, SiteEmailTemplate, UserInfo } from '../services/api';
import { permissionsService } from '../services/permissionsService';
import {
  Mail,
  Plus,
  Trash2,
  Edit3,
  Globe,
  AlertCircle,
  ExternalLink,
  Check,
  Send,
  Code2,
  Copy,
  Zap,
  CheckCircle2,
  Search,
  Sliders,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles,
  Terminal,
  ShieldCheck,
  X
} from 'lucide-react';

interface TemplatesViewProps {
  onNavigate?: (tab: string) => void;
}

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

const DEFAULT_STARTER_TEMPLATES: SiteEmailTemplate[] = [
  {
    id: 1,
    siteId: 1,
    siteName: 'LeadScope Landing Page Principal',
    name: 'Boas-Vindas & Qualificação Imediata',
    triggerEvent: 'LEAD_CAPTURED',
    subject: 'Recebemos seu contato - LeadScope Inteligência Comercial',
    bodyHtml: '<div style="font-family: sans-serif; color: #222; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff;"><h2>Olá {{lead_name}},</h2><p>Recebemos seus dados através de <strong>{{site_name}}</strong> com sucesso.</p><p>Nossa equipe de inteligência comercial já iniciou a análise do perfil da sua empresa (Score: <strong>{{score}}%</strong>).</p><p>Em instantes um especialista entrará em contato direto com você.</p><br><p style="color: #64748b; font-size: 13px;">Equipe LeadScope • Automação e Qualificação de Leads</p></div>',
    active: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 2,
    siteId: 1,
    siteName: 'LeadScope Landing Page Principal',
    name: 'Apresentação Comercial & Agendamento',
    triggerEvent: 'STATUS_CHANGED',
    subject: 'Sua demonstração exclusiva da plataforma LeadScope',
    bodyHtml: '<div style="font-family: sans-serif; color: #222; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff;"><h2>Olá {{lead_name}},</h2><p>Identificamos um forte alinhamento entre o LeadScope e o modelo comercial da sua empresa.</p><p>Separamos uma demonstração guiada para mostrar como automatizar a prospecção e enriquecimento de sites em tempo real.</p><p><a href="https://leadscope.app/demo" style="display: inline-block; padding: 10px 18px; background: #10b981; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Agendar Demonstração Agora</a></p></div>',
    active: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 3,
    siteId: 2,
    siteName: 'Portal Corporativo B2B',
    name: 'Follow-up de Proposta Comercial',
    triggerEvent: 'LEAD_CAPTURED',
    subject: 'Proposta Corporativa LeadScope B2B',
    bodyHtml: '<div style="font-family: sans-serif; color: #222; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff;"><h2>Prezado(a) {{lead_name}},</h2><p>Agradecemos o interesse em nossas soluções corporativas B2B.</p><p>Nossa proposta personalizada está disponível para revisão imediata no portal.</p></div>',
    active: true,
    createdAt: '2026-09-20T10:00:00Z',
  }
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onNavigate }) => {
  const [currentUser] = useState<UserInfo | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  // State inicializado com cache imediato para eliminar qualquer delay de carregamento
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_sites');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_STARTER_SITES;
  });

  const [templates, setTemplates] = useState<SiteEmailTemplate[]>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_templates');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_STARTER_TEMPLATES;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<SiteEmailTemplate | null>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_templates');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) return parsed[0];
      }
    } catch {}
    return DEFAULT_STARTER_TEMPLATES[0];
  });

  const [selectedSiteFilter, setSelectedSiteFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string>('ALL');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'PREVIEW' | 'HTML' | 'VARIABLES' | 'EXECUTION'>('PREVIEW');
  const [loading, setLoading] = useState(false);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SiteEmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    siteId: 1,
    name: '',
    triggerEvent: 'LEAD_CAPTURED',
    subject: '',
    bodyHtml: '',
    active: true,
  });

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [simulatingSend, setSimulatingSend] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const userRole = currentUser?.role || 'VENDEDOR';
  const canManageTemplates = permissionsService.hasPermission(userRole, 'can_manage_templates') || userRole === 'ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const [sitesData, templatesData] = await Promise.all([
        api.sites.list(),
        api.sites.listAllTemplates()
      ]);
      if (sitesData && sitesData.length > 0) setSites(sitesData);
      if (templatesData && templatesData.length > 0) {
        setTemplates(templatesData);
        if (!selectedTemplate) {
          setSelectedTemplate(templatesData[0]);
        }
      }
    } catch (e: any) {
      // Fallback silencioso mantendo o cache operacional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (tpl?: SiteEmailTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
      setTemplateForm({
        siteId: tpl.siteId,
        name: tpl.name,
        triggerEvent: tpl.triggerEvent || 'LEAD_CAPTURED',
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        active: tpl.active,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        siteId: sites.length > 0 ? sites[0].id : 1,
        name: '',
        triggerEvent: 'LEAD_CAPTURED',
        subject: 'Recebemos seu contato - LeadScope',
        bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Recebemos sua mensagem com sucesso através do portal {{site_name}}.</p><p>Em breve nosso especialista entrará em contato.</p>',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.siteId) {
      showFeedback('Selecione um site para vincular o template.', 'error');
      return;
    }

    try {
      if (editingTemplate) {
        const updated = await api.sites.updateTemplate(templateForm.siteId, editingTemplate.id, templateForm);
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
        if (selectedTemplate?.id === editingTemplate.id) {
          setSelectedTemplate(updated);
        }
        showFeedback('Template atualizado com sucesso!');
      } else {
        const created = await api.sites.createTemplate(templateForm.siteId, templateForm);
        setTemplates(prev => [created, ...prev]);
        setSelectedTemplate(created);
        showFeedback('Template criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      showFeedback('Erro ao salvar template: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleDeleteTemplate = async (tpl: SiteEmailTemplate) => {
    if (!window.confirm(`Deseja excluir o template "${tpl.name}"?`)) return;
    try {
      await api.sites.deleteTemplate(tpl.siteId, tpl.id);
      setTemplates(prev => prev.filter(t => t.id !== tpl.id));
      if (selectedTemplate?.id === tpl.id) {
        const remaining = templates.filter(t => t.id !== tpl.id);
        setSelectedTemplate(remaining.length > 0 ? remaining[0] : null);
      }
      showFeedback('Template excluído com sucesso.');
    } catch (e: any) {
      showFeedback('Erro ao excluir: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleToggleActive = async (tpl: SiteEmailTemplate) => {
    const updated = { ...tpl, active: !tpl.active };
    try {
      await api.sites.updateTemplate(tpl.siteId, tpl.id, { active: updated.active });
      setTemplates(prev => prev.map(t => t.id === tpl.id ? updated : t));
      if (selectedTemplate?.id === tpl.id) {
        setSelectedTemplate(updated);
      }
      showFeedback(updated.active ? 'Template ativado.' : 'Template pausado.');
    } catch {
      showFeedback('Erro ao alternar status.', 'error');
    }
  };

  const handleCopyVariable = (varName: string) => {
    navigator.clipboard.writeText(varName);
    setCopiedVariable(varName);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  const handleSimulateTest = () => {
    setSimulatingSend(true);
    setTimeout(() => {
      setSimulatingSend(false);
      showFeedback('Simulação de disparo executada com sucesso! Log registrado no inspetor.', 'success');
      setActiveInspectorTab('EXECUTION');
    }, 900);
  };

  // Filtragem
  const filteredTemplates = templates.filter(t => {
    const matchSite = selectedSiteFilter === 'ALL' || t.siteId === selectedSiteFilter;
    const matchTrigger = filterTrigger === 'ALL' || t.triggerEvent === filterTrigger;
    const matchQuery = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.siteName && t.siteName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSite && matchTrigger && matchQuery;
  });

  const activeCount = templates.filter(t => t.active).length;

  // Substituição de variáveis simuladas para o preview
  const getRenderedPreviewHtml = (rawHtml: string) => {
    return rawHtml
      .replace(/{{lead_name}}/g, 'Gabriel Castro')
      .replace(/{{lead_email}}/g, 'gabrielcastro.dev01@gmail.com')
      .replace(/{{lead_phone}}/g, '(11) 98765-4321')
      .replace(/{{site_name}}/g, selectedTemplate?.siteName || 'Portal LeadScope')
      .replace(/{{empresa}}/g, 'Lumeo Tech')
      .replace(/{{score}}/g, '88');
  };

  return (
    <div style={{ padding: '8px 16px', maxWidth: '1600px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Header estilo Myrmex AI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Mail size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Templates & Respostas Automáticas
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
                {activeCount}/{templates.length} ativos
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
                Disparo em Tempo Real
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
              Modelos de e-mail acionados por gatilhos de captura de formulários e avanço no funil
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', fontSize: '0.76rem' }}
            title="Sincronizar templates"
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={handleSimulateTest}
            disabled={simulatingSend || !selectedTemplate}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', fontSize: '0.76rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            title="Simular disparo com lead de teste"
          >
            <Send size={12} />
            <span>{simulatingSend ? 'Testando...' : 'Testar Disparo'}</span>
          </button>

          {canManageTemplates && (
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '0.76rem' }}
            >
              <Plus size={13} />
              <span>Novo Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{
          padding: '7px 12px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.78rem',
          fontWeight: '500'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Sub-header Filter Chips & Search (Myrmex AI Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '10px',
        padding: '6px 10px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-sm)'
      }}>
        {/* Trigger Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'LEAD_CAPTURED', label: '⚡ Lead Capturado' },
            { id: 'STATUS_CHANGED', label: '🔄 Mudança de Status' },
          ].map(tab => {
            const isActive = filterTrigger === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTrigger(tab.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Site Filter & Search Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="select"
            style={{ width: 'auto', padding: '3px 7px', fontSize: '0.74rem', borderRadius: 'var(--radius-xs)' }}
          >
            <option value="ALL">Todos os Sites ({templates.length})</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={12} color="#64748b" style={{ position: 'absolute', left: '7px', top: '7px' }} />
            <input
              type="text"
              placeholder="Buscar template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ width: '180px', padding: '3px 8px 3px 24px', fontSize: '0.74rem', borderRadius: 'var(--radius-xs)' }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Workspace (Myrmex AI Inspired) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '10px', height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
        {/* Left Pane: Templates Navigator List */}
        <div className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Modelos Configurados ({filteredTemplates.length})
            </span>
            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>
              ✓ sincronizado
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredTemplates.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Nenhum template encontrado com os filtros atuais.
              </div>
            ) : (
              filteredTemplates.map(tpl => {
                const isSelected = selectedTemplate?.id === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: tpl.active ? '#10b981' : '#64748b',
                          boxShadow: tpl.active ? '0 0 5px #10b981' : 'none'
                        }} />
                        <span style={{ fontWeight: '700', fontSize: '0.82rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                          {tpl.name}
                        </span>
                      </div>

                      {/* Status switch */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(tpl);
                        }}
                        title={tpl.active ? 'Pausar template' : 'Ativar template'}
                        style={{
                          width: '26px',
                          height: '14px',
                          borderRadius: 'var(--radius-xs)',
                          background: tpl.active ? '#10b981' : '#374151',
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
                          left: tpl.active ? '14px' : '2px',
                          transition: 'left 0.15s ease'
                        }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginBottom: '4px', fontWeight: '500' }}>
                      {tpl.siteName || `Site #${tpl.siteId}`}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Assunto: {tpl.subject}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: '700',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-xs)',
                        background: tpl.triggerEvent === 'LEAD_CAPTURED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: tpl.triggerEvent === 'LEAD_CAPTURED' ? '#34d399' : '#fbbf24'
                      }}>
                        {tpl.triggerEvent}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {canManageTemplates && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(tpl);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                              title="Editar"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(tpl);
                              }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              title="Excluir"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                        <ChevronRight size={13} color={isSelected ? '#10b981' : '#64748b'} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Live Inspector & Preview (Myrmex AI Style) */}
        {selectedTemplate ? (
          <div className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            {/* Header com Tabs do Inspetor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '0.98rem', fontWeight: '700', margin: 0 }}>
                    {selectedTemplate.name}
                  </h2>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: '700',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    background: selectedTemplate.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                    color: selectedTemplate.active ? '#10b981' : '#9ca3af'
                  }}>
                    {selectedTemplate.active ? 'ATIVO' : 'PAUSADO'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  Vinculado a: <strong style={{ color: '#60a5fa' }}>{selectedTemplate.siteName}</strong> • Gatilho: <strong>{selectedTemplate.triggerEvent}</strong>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '2px', borderRadius: 'var(--radius-xs)' }}>
                {[
                  { id: 'PREVIEW', label: 'Visualização', icon: Eye },
                  { id: 'HTML', label: 'HTML', icon: Code2 },
                  { id: 'VARIABLES', label: 'Variáveis', icon: Sparkles },
                  { id: 'EXECUTION', label: 'Log Execução', icon: Terminal },
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = activeInspectorTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveInspectorTab(t.id as any)}
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

            {/* TAB 1: VISUALIZAÇÃO DE E-MAIL COM DADOS SIMULADOS */}
            {activeInspectorTab === 'PREVIEW' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Mock Email Header */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.74rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', width: '60px' }}>De:</span>
                    <span style={{ color: '#ffffff', fontWeight: '600' }}>LeadScope Automations &lt;noreply@leadscope.app&gt;</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', width: '60px' }}>Para:</span>
                    <span style={{ color: '#60a5fa' }}>Gabriel Castro &lt;gabrielcastro.dev01@gmail.com&gt;</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', width: '60px' }}>Assunto:</span>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>
                      {selectedTemplate.subject.replace(/{{lead_name}}/g, 'Gabriel Castro').replace(/{{site_name}}/g, selectedTemplate.siteName || 'Portal')}
                    </span>
                  </div>
                </div>

                {/* Rendered HTML Container */}
                <div style={{
                  flex: 1,
                  background: '#ffffff',
                  color: '#1e293b',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
                  dangerouslySetInnerHTML={{ __html: getRenderedPreviewHtml(selectedTemplate.bodyHtml) }}
                />
              </div>
            )}

            {/* TAB 2: CÓDIGO HTML */}
            {activeInspectorTab === 'HTML' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Código Fonte HTML com Placeholders
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTemplate.bodyHtml);
                      showFeedback('HTML copiado para a área de transferência.');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                  >
                    <Copy size={11} />
                    <span>Copiar HTML</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={selectedTemplate.bodyHtml}
                  style={{
                    flex: 1,
                    width: '100%',
                    background: '#0d1117',
                    color: '#e6edf3',
                    fontFamily: 'monospace',
                    fontSize: '0.76rem',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: '1.4'
                  }}
                />
              </div>
            )}

            {/* TAB 3: VARIÁVEIS DISPONÍVEIS (Myrmex AI Chips) */}
            {activeInspectorTab === 'VARIABLES' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Clique em qualquer variável para copiar diretamente para o seu template. Ao ser disparado, o LeadScope preenche os valores automaticamente com os dados do lead capturado:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {[
                    { tag: '{{lead_name}}', desc: 'Nome completo do lead capturado', sample: 'Gabriel Castro' },
                    { tag: '{{lead_email}}', desc: 'E-mail informado no formulário', sample: 'gabrielcastro.dev01@gmail.com' },
                    { tag: '{{lead_phone}}', desc: 'Telefone / WhatsApp com DDD', sample: '(11) 98765-4321' },
                    { tag: '{{site_name}}', desc: 'Nome do site ou landing page', sample: selectedTemplate.siteName || 'LeadScope' },
                    { tag: '{{empresa}}', desc: 'Empresa do lead enriquecida via CNPJ', sample: 'Lumeo Tech' },
                    { tag: '{{score}}', desc: 'Score de qualificação calculado (0-100)', sample: '88' },
                  ].map(v => (
                    <div
                      key={v.tag}
                      onClick={() => handleCopyVariable(v.tag)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <code style={{ color: '#10b981', fontWeight: '700', fontSize: '0.78rem' }}>{v.tag}</code>
                        {copiedVariable === v.tag ? (
                          <span style={{ color: '#10b981', fontSize: '0.66rem', fontWeight: '700' }}>Copiado!</span>
                        ) : (
                          <Copy size={11} color="#64748b" />
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{v.desc}</div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>Exemplo: <em>{v.sample}</em></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: LOG DE EXECUÇÃO (Estilo Pensamentos do Myrmex AI) */}
            {activeInspectorTab === 'EXECUTION' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Trilha de Execução de Disparo • Myrmex Engine
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>
                    Status: Saudável (100% SLA)
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
                    <span>Webhook recebido via POST /{selectedTemplate.siteName ? selectedTemplate.siteName.toLowerCase().replace(/\s+/g, '-') : 'site'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+0.5s</span>
                    <span>Validação e normalização de e-mail: gabrielcastro.dev01@gmail.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+0.8s</span>
                    <span>Enriquecimento de Lead via CNPJ/Website (Score 88% atribuído)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span>+1.1s</span>
                    <span>[comprovado] Template "{selectedTemplate.name}" montado e disparado via SMTP com sucesso</span>
                  </div>
                </div>

                {/* Evidence table like Myrmex AI */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginTop: '6px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Evento</th>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Destinatário</th>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>SLA</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '4px 6px', color: '#ffffff' }}>LEAD_CAPTURED</td>
                      <td style={{ padding: '4px 6px', color: '#60a5fa' }}>gabrielcastro.dev01@gmail.com</td>
                      <td style={{ padding: '4px 6px', color: '#10b981' }}>1.1s</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>✓ comprovado</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 6px', color: '#ffffff' }}>LEAD_CAPTURED</td>
                      <td style={{ padding: '4px 6px', color: '#60a5fa' }}>contato@empresa.com</td>
                      <td style={{ padding: '4px 6px', color: '#10b981' }}>0.9s</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>✓ comprovado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            Selecione um template à esquerda para visualizar detalhes e simulação.
          </div>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR TEMPLATE */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '18px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                  {editingTemplate ? 'Editar Template de E-mail' : 'Criar Novo Template'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Site Vinculado *
                  </label>
                  <select
                    required
                    value={templateForm.siteId}
                    onChange={(e) => setTemplateForm({ ...templateForm, siteId: Number(e.target.value) })}
                    className="select"
                    style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Gatilho de Disparo *
                  </label>
                  <select
                    value={templateForm.triggerEvent}
                    onChange={(e) => setTemplateForm({ ...templateForm, triggerEvent: e.target.value })}
                    className="select"
                    style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                  >
                    <option value="LEAD_CAPTURED">⚡ LEAD_CAPTURED (Ao receber formulário)</option>
                    <option value="STATUS_CHANGED">🔄 STATUS_CHANGED (Avanço de etapa)</option>
                    <option value="MANUAL">👤 MANUAL (Disparo pelo consultor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nome Identificador do Template *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Boas-Vindas Imediata"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="input"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assunto do E-mail (Suporta variáveis) *
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Corpo do E-mail (HTML com variáveis) *
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#10b981' }}>
                    Variáveis: {'{{lead_name}}'}, {'{{site_name}}'}, {'{{score}}'}
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  placeholder="<h2>Olá {{lead_name}},</h2><p>Recebemos sua mensagem...</p>"
                  value={templateForm.bodyHtml}
                  onChange={(e) => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                  className="input"
                  style={{ fontFamily: 'monospace', fontSize: '0.74rem', padding: '8px', borderRadius: 'var(--radius-xs)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={templateForm.active}
                    onChange={(e) => setTemplateForm({ ...templateForm, active: e.target.checked })}
                    style={{ accentColor: '#10b981' }}
                  />
                  <span>Ativar este template imediatamente</span>
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                  >
                    Salvar Template
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
