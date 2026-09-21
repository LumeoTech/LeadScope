import React, { useEffect, useState } from 'react';
import { api, Site, SiteEmailTemplate } from '../services/api';
import { Mail, Plus, Trash2, Edit3, Globe, AlertCircle, ExternalLink } from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [templates, setTemplates] = useState<SiteEmailTemplate[]>([]);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<number | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SiteEmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    siteId: 0,
    name: '',
    triggerEvent: 'LEAD_CAPTURED',
    subject: '',
    bodyHtml: '',
    active: true,
  });

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sitesData, templatesData] = await Promise.all([
        api.sites.list(),
        api.sites.listAllTemplates().catch(() => [])
      ]);
      setSites(sitesData || []);
      setTemplates(templatesData || []);
    } catch (e: any) {
      showFeedback('Erro ao carregar dados: ' + (e.message || 'Falha de conexão'), 'error');
    } finally {
      setLoading(false);
    }
  };

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
        siteId: sites.length > 0 ? sites[0].id : 0,
        name: '',
        triggerEvent: 'LEAD_CAPTURED',
        subject: '',
        bodyHtml: '<h2>Olá {{lead_name}},</h2><p>Recebemos sua mensagem com sucesso através do portal {{site_name}}.</p><p>Em breve nosso especialista entrará em contato.</p>',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.siteId) {
      alert('Selecione um site para associar o template.');
      return;
    }

    try {
      if (editingTemplate) {
        await api.sites.updateTemplate(templateForm.siteId, editingTemplate.id, {
          name: templateForm.name,
          triggerEvent: templateForm.triggerEvent,
          subject: templateForm.subject,
          bodyHtml: templateForm.bodyHtml,
          active: templateForm.active,
        });
        showFeedback('Template atualizado com sucesso!');
      } else {
        await api.sites.createTemplate(templateForm.siteId, {
          name: templateForm.name,
          triggerEvent: templateForm.triggerEvent,
          subject: templateForm.subject,
          bodyHtml: templateForm.bodyHtml,
          active: templateForm.active,
        });
        showFeedback('Novo template criado com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      showFeedback('Erro ao salvar template: ' + (e.message || 'Erro'), 'error');
    }
  };

  const handleDeleteTemplate = async (tpl: SiteEmailTemplate) => {
    if (!window.confirm(`Deseja realmente excluir o template "${tpl.name}"?`)) return;
    try {
      await api.sites.deleteTemplate(tpl.siteId, tpl.id);
      showFeedback('Template excluído com sucesso!');
      loadData();
    } catch (e: any) {
      showFeedback('Erro ao excluir template: ' + (e.message || 'Erro'), 'error');
    }
  };

  const insertVariable = (variable: string) => {
    setTemplateForm(prev => ({
      ...prev,
      bodyHtml: prev.bodyHtml + variable,
    }));
  };

  const filteredTemplates = selectedSiteFilter === 'ALL'
    ? templates
    : templates.filter(t => t.siteId === selectedSiteFilter);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <Mail size={20} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Templates de E-mail</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Configure modelos de e-mail personalizados disparados automaticamente na captação de leads de cada site.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          disabled={sites.length === 0}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>Novo Template</span>
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: feedback.type === 'success' ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          {feedback.text}
        </div>
      )}

      {/* Filter by Site */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Filtrar por Site:
        </span>
        <select
          value={selectedSiteFilter}
          onChange={(e) => setSelectedSiteFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="input-field"
          style={{ minWidth: '220px', fontSize: '0.85rem', padding: '6px 12px' }}
        >
          <option value="ALL">Todos os Sites ({templates.length} templates)</option>
          {sites.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Carregando templates...
        </div>
      ) : sites.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Nenhum site cadastrado</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 16px auto', fontSize: '0.9rem' }}>
            Para criar templates de e-mail automáticos, cadastre primeiro um site na aba "Sites".
          </p>
          <button
            type="button"
            onClick={() => {
              const sitesTabBtn = document.querySelector('button[title="Sites"]') as HTMLButtonElement;
              if (sitesTabBtn) sitesTabBtn.click();
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Cadastrar Site Agora</span>
          </button>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Mail size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Nenhum template encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
            Cadastre seu primeiro template de email com respostas dinâmicas para este site.
          </p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Criar Primeiro Template
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>{tpl.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Globe size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: '600' }}>
                        {tpl.siteName || `Site #${tpl.siteId}`}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${tpl.active ? 'badge-success' : 'badge-danger'}`}>
                    {tpl.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Assunto:
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {tpl.subject}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                    Visualização HTML:
                  </span>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      maxHeight: '120px',
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
                  onClick={() => handleOpenModal(tpl)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={14} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteTemplate(tpl)}
                  className="btn btn-danger btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Template */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', padding: '28px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px' }}>
              {editingTemplate ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}
            </h3>

            <form onSubmit={handleSaveTemplate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Site Associado *
                  </label>
                  <select
                    value={templateForm.siteId}
                    onChange={(e) => setTemplateForm({ ...templateForm, siteId: Number(e.target.value) })}
                    className="input-field"
                    style={{ width: '100%' }}
                    disabled={Boolean(editingTemplate)}
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Boas-vindas Lead Novo"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Assunto do E-mail *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Olá {{lead_name}}, recebemos seu contato na {{site_name}}!"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Tags dinâmicas */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Tags Dinâmicas (clique para inserir no corpo do email):
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
                  Corpo do E-mail (HTML) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={templateForm.bodyHtml}
                  onChange={(e) => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="tplActiveMain"
                  checked={templateForm.active}
                  onChange={(e) => setTemplateForm({ ...templateForm, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="tplActiveMain" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Ativar envio automático para leads capturados
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
