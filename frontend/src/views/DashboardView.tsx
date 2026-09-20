import React, { useEffect, useState } from 'react';
import { api, Lead, Company, Activity } from '../services/api';
import {
  Kanban,
  Radar,
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  PhoneCall,
  UserCheck,
  Target
} from 'lucide-react';
import { ActiveTab } from '../components/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsRes, compRes, actRes] = await Promise.all([
        api.leads.list(),
        api.companies.list(),
        api.activities.listUpcoming(),
      ]);
      setLeads(leadsRes.content || []);
      setCompanies(compRes.content || []);
      setUpcomingActivities(actRes || []);
    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // Métricas 100% reais calculadas a partir dos leads do usuário logado
  const totalLeads = leads.length;

  const newLeads = leads.filter(l => {
    const s = (l.statusName || '').toLowerCase();
    return s.includes('novo') || s.includes('aberto') || l.statusId === 1;
  }).length;

  const contactedLeads = leads.filter(l => {
    const s = (l.statusName || '').toLowerCase();
    return s.includes('contat') || s.includes('contato') || s.includes('reuni') || s.includes('apresent');
  }).length;

  const qualifiedLeads = leads.filter(l => {
    const s = (l.statusName || '').toLowerCase();
    return s.includes('qualific') || s.includes('proposta') || s.includes('negocia');
  }).length;

  const wonLeads = leads.filter(l => {
    const s = (l.statusName || '').toLowerCase();
    return s.includes('ganh') || s.includes('fech') || s.includes('contrat');
  }).length;

  const discardedLeads = leads.filter(l => {
    const s = (l.statusName || '').toLowerCase();
    return s.includes('descart') || s.includes('perdid');
  }).length;

  const totalPipelineValue = leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const avgTicket = totalLeads > 0 ? (totalPipelineValue / totalLeads) : 0;
  const totalClients = companies.filter(c => c.isClient).length;

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Visão Geral
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Métricas e resultados da sua carteira comercial em tempo real
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('scanner')} className="btn btn-secondary">
            <Radar size={16} color="var(--accent-primary)" />
            <span>Nova Prospecção</span>
          </button>
          <button onClick={() => setActiveTab('kanban')} className="btn btn-primary">
            <Kanban size={16} />
            <span>Seus Clientes</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Reais do Usuário Logado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Total de Leads */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>TOTAL DE LEADS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="var(--accent-primary)" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {totalLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Na sua carteira de atendimento
          </div>
        </div>

        {/* Leads Novos */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>LEADS NOVOS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#3b82f6" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#3b82f6', marginBottom: '4px' }}>
              {newLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Aguardando primeiro contato
          </div>
        </div>

        {/* Contatados / Reunião */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>CONTATADOS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={18} color="#f59e0b" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#f59e0b', marginBottom: '4px' }}>
              {contactedLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Em alinhamento ou reunião
          </div>
        </div>

        {/* Qualificados */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>QUALIFICADOS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} color="#a855f7" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#a855f7', marginBottom: '4px' }}>
              {qualifiedLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Perfil validado e em proposta
          </div>
        </div>

        {/* Convertidos / Ganhos */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>GANHOS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>
              {wonLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: '#10b981' }}>
            Propostas fechadas com sucesso
          </div>
        </div>

        {/* Descartados */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>DESCARTADOS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={18} color="#ef4444" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '60px', height: '32px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>
              {discardedLeads}
            </div>
          )}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Sem perfil ou sem retorno
          </div>
        </div>
      </div>

      {/* Destaque Financeiro Real */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600' }}>VALOR TOTAL DO PIPELINE</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color="var(--accent-primary)" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '140px', height: '36px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPipelineValue)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981' }}>
            <TrendingUp size={14} />
            <span>Volume em negociação ativa</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600' }}>TICKET MÉDIO ESTIMADO</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-line" style={{ width: '140px', height: '36px', marginBottom: '8px' }} />
          ) : (
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgTicket)}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Média real por oportunidade em aberto
          </div>
        </div>
      </div>

      {/* Grid: Leads Recentes & Agenda */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Recent Leads */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Seus Clientes Recentes
            </h3>
            <button onClick={() => setActiveTab('kanban')} className="btn btn-secondary btn-sm">
              <span>Ver carteira</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
              <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
              <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              Nenhum lead atribuído à sua carteira ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {lead.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {lead.companyRazaoSocial || lead.companyName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                      {lead.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value) : 'A definir'}
                    </div>
                    <span className="badge" style={{ background: `${lead.statusColor}22`, color: lead.statusColor, border: `1px solid ${lead.statusColor}55`, fontSize: '0.7rem' }}>
                      {lead.statusName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agenda / Upcoming Meetings */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Agenda de Atendimento
            </h3>
            <button onClick={() => setActiveTab('agenda')} className="btn btn-secondary btn-sm">
              <Calendar size={14} />
              <span>Agenda Completa</span>
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
              <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '8px' }} />
            </div>
          ) : upcomingActivities.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              Nenhum compromisso ou reunião agendada no momento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span className="badge badge-primary">{act.type}</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{act.title}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lead: {act.leadTitle}</div>
                  </div>
                  {act.scheduledAt && (
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '600' }}>
                      {new Date(act.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
