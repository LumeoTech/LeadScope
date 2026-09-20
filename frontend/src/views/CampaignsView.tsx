import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Plus,
  Search,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Mail,
  Phone,
  Radar,
  X,
  AlertTriangle
} from 'lucide-react';

export interface Campaign {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'TELEFONE' | 'SCANNER';
  status: 'ATIVA' | 'PAUSADA' | 'CONCLUIDA';
  targetLeads: number;
  leadsCaptured: number;
  conversionRate: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Prospecção Clínicas Odontológicas SP',
    channel: 'SCANNER',
    status: 'ATIVA',
    targetLeads: 50,
    leadsCaptured: 34,
    conversionRate: 18.5,
    budget: 1200,
    spent: 650,
    startDate: '2026-09-01',
    description: 'Varredura de clínicas de odontologia na capital e Grande SP via Scanner B2B.'
  },
  {
    id: 'camp-2',
    name: 'Outreach B2B Médicos & Dermatologia',
    channel: 'WHATSAPP',
    status: 'ATIVA',
    targetLeads: 40,
    leadsCaptured: 28,
    conversionRate: 21.0,
    budget: 800,
    spent: 420,
    startDate: '2026-09-05',
    description: 'Abordagem consultiva por mensagem via WhatsApp Business para secretárias e gestores.'
  },
  {
    id: 'camp-3',
    name: 'Cold Mail B2B Serviços & Consultorias',
    channel: 'EMAIL',
    status: 'PAUSADA',
    targetLeads: 80,
    leadsCaptured: 42,
    conversionRate: 12.4,
    budget: 500,
    spent: 310,
    startDate: '2026-08-20',
    description: 'Sequência de nutrição e proposta comercial automatizada.'
  },
  {
    id: 'camp-4',
    name: 'Reativação de Leads Perdidos Q2',
    channel: 'TELEFONE',
    status: 'ATIVA',
    targetLeads: 25,
    leadsCaptured: 16,
    conversionRate: 25.0,
    budget: 400,
    spent: 200,
    startDate: '2026-09-10',
    description: 'Ligação de reativação com condições especiais de fechamento.'
  },
  {
    id: 'camp-5',
    name: 'Campanha de Expansão Interior SP',
    channel: 'SCANNER',
    status: 'CONCLUIDA',
    targetLeads: 60,
    leadsCaptured: 60,
    conversionRate: 19.8,
    budget: 1500,
    spent: 1500,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    description: 'Mapeamento das regiões de Campinas, Sorocaba e Ribeirão Preto.'
  }
];

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('lumeo_crm_campaigns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_CAMPAIGNS;
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  // Form New Campaign
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'TELEFONE' | 'SCANNER'>('SCANNER');
  const [targetLeads, setTargetLeads] = useState('50');
  const [budget, setBudget] = useState('1000');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem('lumeo_crm_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      channel,
      status: 'ATIVA',
      targetLeads: Number(targetLeads) || 30,
      leadsCaptured: 0,
      conversionRate: 0,
      budget: Number(budget) || 0,
      spent: 0,
      startDate: new Date().toISOString().slice(0, 10),
      description: description.trim()
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setShowNewModal(false);
    setName('');
    setDescription('');
    setTargetLeads('50');
    setBudget('1000');
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const next = c.status === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  const handleDeleteCampaign = () => {
    if (!campaignToDelete) return;
    setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete.id));
    setCampaignToDelete(null);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
    if (!matchSearch) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  // Aggregated real metrics
  const totalLeadsGoal = campaigns.reduce((acc, c) => acc + c.targetLeads, 0);
  const totalLeadsDone = campaigns.reduce((acc, c) => acc + c.leadsCaptured, 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const activeCount = campaigns.filter(c => c.status === 'ATIVA').length;

  const renderChannelIcon = (ch: Campaign['channel']) => {
    switch (ch) {
      case 'WHATSAPP':
        return <MessageSquare size={16} color="#25D366" />;
      case 'EMAIL':
        return <Mail size={16} color="#3b82f6" />;
      case 'TELEFONE':
        return <Phone size={16} color="#f59e0b" />;
      case 'SCANNER':
      default:
        return <Radar size={16} color="#8b5cf6" />;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            Campanhas Comerciais
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Gerencie ações de prospecção, disparos de mensagens e captação ativa de leads
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
            />
          </div>

          <button onClick={() => setShowNewModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>+ Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Campanhas Ativas</div>
          <div className="stat-kpi-val">{activeCount} / {campaigns.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>em execução contínua</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total de Leads Capturados</div>
          <div className="stat-kpi-val">{totalLeadsDone}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta conjunta: {totalLeadsGoal} leads</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Orçamento Alocado</div>
          <div className="stat-kpi-val">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verba total de prospecção</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Taxa Média de Sucesso</div>
          <div className="stat-kpi-val">
            {campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + c.conversionRate, 0) / campaigns.length).toFixed(1) : 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Conversão média do funil</div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {(['ALL', 'ATIVA', 'PAUSADA', 'CONCLUIDA'] as const).map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: filterStatus === st ? 'var(--btn-primary-bg)' : 'var(--bg-surface)',
              color: filterStatus === st ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {st === 'ALL' ? `Todas (${campaigns.length})` : st === 'ATIVA' ? 'Ativas' : st === 'PAUSADA' ? 'Pausadas' : 'Concluídas'}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredCampaigns.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '12px' }}>
            Nenhuma campanha encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredCampaigns.map(camp => {
            const progress = Math.min(100, Math.round((camp.leadsCaptured / (camp.targetLeads || 1)) * 100));

            return (
              <div
                key={camp.id}
                className="card"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--bg-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {renderChannelIcon(camp.channel)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {camp.name}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Início: {new Date(camp.startDate).toLocaleDateString('pt-BR')} • {camp.channel}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: camp.status === 'ATIVA' ? 'rgba(16, 185, 129, 0.12)' : camp.status === 'PAUSADA' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(148, 163, 184, 0.15)',
                    color: camp.status === 'ATIVA' ? '#10b981' : camp.status === 'PAUSADA' ? '#f59e0b' : 'var(--text-muted)'
                  }}>
                    {camp.status}
                  </span>
                </div>

                {camp.description && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {camp.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Progresso de Leads</span>
                    <strong>{camp.leadsCaptured} de {camp.targetLeads} ({progress}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progress >= 100 ? '#10b981' : 'var(--accent-coral)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Footer stats & actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Verba: <strong style={{ color: 'var(--text-primary)' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.budget)}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(camp.id)}
                      title={camp.status === 'ATIVA' ? 'Pausar Campanha' : 'Ativar Campanha'}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: camp.status === 'ATIVA' ? '#f59e0b' : '#10b981',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {camp.status === 'ATIVA' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCampaignToDelete(camp)}
                      title="Excluir Campanha"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nova Campanha */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Criar Nova Campanha
              </h2>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome da Campanha *
                </label>
                <input
                  required
                  className="input"
                  placeholder="Ex: Prospecção Odonto SP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Canal Principal
                  </label>
                  <select
                    className="select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                  >
                    <option value="SCANNER">Scanner B2B</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">E-mail Outreach</option>
                    <option value="TELEFONE">Ligações (Cold Call)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Meta de Leads
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={targetLeads}
                    onChange={(e) => setTargetLeads(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Orçamento Previsto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="1000.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Descrição / Objetivo
                </label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Detalhes dos nichos ou regiões a serem abordados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Campanha */}
      {campaignToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Excluir Campanha</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deseja realmente remover a campanha <strong>{campaignToDelete.name}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setCampaignToDelete(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCampaign}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
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
