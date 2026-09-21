import React, { useEffect, useState } from 'react';
import { api, Site } from '../services/api';
import {
  Globe,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  Sparkles,
  Layers,
  X,
  Image as ImageIcon
} from 'lucide-react';

const DEFAULT_PORTFOLIO_SITES: Site[] = [
  {
    id: 1,
    name: 'Portal Dra. Camila Silveira Odontologia',
    clientName: 'Dra. Camila Silveira',
    url: 'https://dracamilasilveira.com.br',
    thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    deliveryDate: '2026-08-15',
    status: 'Online',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Advocacia & Consultoria Jurídica Rocha',
    clientName: 'Dr. Roberto Rocha',
    url: 'https://rochajuridico.adv.br',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    deliveryDate: '2026-09-02',
    status: 'Online',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    name: 'Studio Arquitetura & Interiores Forma',
    clientName: 'Mariana Duarte Arquitetura',
    url: 'https://formaarquitetura.com.br',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    deliveryDate: '2026-09-18',
    status: 'Em desenvolvimento',
    createdAt: '2026-09-18T10:00:00Z',
  }
];

export const SitesView: React.FC = () => {
  // Carregamento instantâneo via cache local
  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const cached = localStorage.getItem('lumeo_cached_sites');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PORTFOLIO_SITES;
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Online' | 'Em desenvolvimento' | 'Em manutenção'>('TODOS');

  // Modal de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    url: '',
    thumbnail: '',
    status: 'Online' as 'Online' | 'Em desenvolvimento' | 'Em manutenção',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  // Modal de Exclusão
  const [deleteConfirmSite, setDeleteConfirmSite] = useState<Site | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadSites = async () => {
    try {
      const data = await api.sites.list();
      if (Array.isArray(data)) {
        setSites(data);
      }
    } catch {
      // Falha silenciosa; usa cache ativo
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const openCreateModal = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      clientName: '',
      url: '',
      thumbnail: '',
      status: 'Online',
      deliveryDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name || '',
      clientName: site.clientName || '',
      url: site.url || '',
      thumbnail: site.thumbnail || '',
      status: (site.status as any) || 'Online',
      deliveryDate: site.deliveryDate || (site.createdAt ? site.createdAt.split('T')[0] : new Date().toISOString().split('T')[0])
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showFeedback('Informe o nome do site.', 'error');
      return;
    }
    if (!formData.clientName.trim()) {
      showFeedback('Informe o nome do cliente.', 'error');
      return;
    }
    if (!formData.url.trim()) {
      showFeedback('Informe a URL do site.', 'error');
      return;
    }

    let formattedUrl = formData.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setLoading(true);
    try {
      if (editingSite) {
        const updated = await api.sites.update(editingSite.id, {
          name: formData.name.trim(),
          clientName: formData.clientName.trim(),
          url: formattedUrl,
          thumbnail: formData.thumbnail.trim(),
          status: formData.status,
          deliveryDate: formData.deliveryDate
        });
        setSites(prev => prev.map(s => s.id === editingSite.id ? { ...s, ...updated } : s));
        showFeedback('Site atualizado com sucesso no portfólio!');
      } else {
        const created = await api.sites.create({
          name: formData.name.trim(),
          clientName: formData.clientName.trim(),
          url: formattedUrl,
          thumbnail: formData.thumbnail.trim(),
          status: formData.status,
          deliveryDate: formData.deliveryDate
        });
        setSites(prev => [created, ...prev.filter(s => s.id !== created.id)]);
        showFeedback('Site cadastrado com sucesso no portfólio!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao salvar site.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.sites.delete(id);
      setSites(prev => prev.filter(s => s.id !== id));
      setDeleteConfirmSite(null);
      showFeedback('Site removido do portfólio.');
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao excluir site.', 'error');
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch =
      (site.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.url || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || (site.status || 'Online') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Em desenvolvimento':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.35)',
          color: '#60a5fa',
          label: 'Em desenvolvimento'
        };
      case 'Em manutenção':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
          color: '#fbbf24',
          label: 'Em manutenção'
        };
      case 'Online':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          label: 'Online'
        };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informada';
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
    } catch {}
    return dateStr;
  };

  return (
    <div style={{
      maxWidth: '1380px',
      margin: '0 auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* HEADER DA PÁGINA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#1e3a5f',
              border: '1px solid #2e558a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Portfólio de Sites de Clientes
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Catálogo completo dos sites desenvolvidos, clientes atendidos, datas de entrega e status online
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{
            padding: '8px 18px',
            fontSize: '0.84rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          <span>Cadastrar Site</span>
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
          color: feedback.type === 'success' ? '#34d399' : '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* BARRA DE FILTROS & PESQUISA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '14px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px'
      }}>
        {/* Campo de Busca */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do site, cliente ou URL..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filtro por Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
          {(['TODOS', 'Online', 'Em desenvolvimento', 'Em manutenção'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: statusFilter === st ? '1px solid #1e3a5f' : '1px solid var(--border-subtle)',
                background: statusFilter === st ? '#1e3a5f' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: statusFilter === st ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE SITES CADASTRADOS */}
      {filteredSites.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '10px'
        }}>
          <Globe size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            Nenhum site encontrado no portfólio
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            {searchQuery || statusFilter !== 'TODOS'
              ? 'Tente ajustar os filtros de busca para encontrar os sites desejados.'
              : 'Comece adicionando seu primeiro site desenvolvido para clientes.'}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            <Plus size={15} />
            <span>Cadastrar Primeiro Site</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredSites.map(site => {
            const badge = getStatusBadge(site.status);
            return (
              <div
                key={site.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* PREVIEW / THUMBNAIL DO SITE */}
                <div style={{
                  height: '170px',
                  width: '100%',
                  background: '#090d16',
                  position: 'relative',
                  overflow: 'hidden',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  {site.thumbnail ? (
                    <img
                      src={site.thumbnail}
                      alt={site.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: 'var(--text-muted)',
                      background: 'radial-gradient(circle at 50% 50%, #151d2f 0%, #090d16 100%)'
                    }}>
                      <Globe size={32} style={{ opacity: 0.4 }} />
                      <span style={{ fontSize: '0.74rem' }}>Pré-visualização do site</span>
                    </div>
                  )}

                  {/* Status Badge sobreposto na thumbnail */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: badge.color
                    }} />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* CORPO DO CARD */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Título & Cliente */}
                  <div>
                    <h3 style={{
                      fontSize: '0.98rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      margin: '0 0 4px 0',
                      lineHeight: '1.3'
                    }}>
                      {site.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      <User size={13} color="var(--text-muted)" />
                      <span>Cliente: <strong style={{ color: 'var(--text-primary)' }}>{site.clientName || 'Não informado'}</strong></span>
                    </div>
                  </div>

                  {/* Detalhes de URL e Entrega */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.76rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>URL do Site:</span>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#60a5fa',
                          textDecoration: 'none',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '190px'
                        }}
                      >
                        {site.url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        Data de Entrega:
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        {formatDate(site.deliveryDate)}
                      </span>
                    </div>
                  </div>

                  {/* AÇÕES NO RODAPÉ */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    {/* Botão de Abrir Site em Nova Aba */}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Abrir Site</span>
                    </a>

                    {/* Botões de Ação Rápida: Editar e Excluir */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => openEditModal(site)}
                        title="Editar site"
                        style={{
                          padding: '6px 10px',
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmSite(site)}
                        title="Excluir site"
                        style={{
                          padding: '6px 10px',
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: '#f87171',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR SITE */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={18} color="#93c5fd" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {editingSite ? 'Editar Site do Portfólio' : 'Cadastrar Novo Site'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nome do Site */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome do Site *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Portal Dra. Camila Silveira Odontologia"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Nome do Cliente */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Ex: Dra. Camila Silveira"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* URL do Site */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  URL do Site *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Ex: https://dracamilasilveira.com.br"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Thumbnail / Imagem de Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Thumbnail / URL da Imagem de Pré-visualização (opcional)
                </label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="Ex: https://meusite.com/preview.jpg"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status e Data de Entrega (2 colunas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Status do Site
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(15, 21, 35, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Online">Online</option>
                    <option value="Em desenvolvimento">Em desenvolvimento</option>
                    <option value="Em manutenção">Em manutenção</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      background: 'rgba(15, 21, 35, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* BOTOES MODAL */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.82rem' }}
                >
                  {loading ? 'Salvando...' : (editingSite ? 'Atualizar Site' : 'Cadastrar Site')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirmSite && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#f87171'
            }}>
              <Trash2 size={22} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Excluir site do portfólio?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
              Tem certeza que deseja remover <strong>"{deleteConfirmSite.name}"</strong>? Esta ação não pode ser desfeita.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirmSite(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmSite.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesView;
