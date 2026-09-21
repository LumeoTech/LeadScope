import React, { useState, useEffect } from 'react';
import { api, Lead, Company } from '../services/api';
import {
  Target,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Building2,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

export interface CommercialGoal {
  id: string;
  title: string;
  category: 'REVENUE' | 'LEADS' | 'CLIENTS' | 'PROPOSALS';
  targetValue: number;
  currentValue: number;
  period: string; // Ex: 'Setembro 2026'
  deadline: string;
}

const DEFAULT_GOALS: CommercialGoal[] = [];

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<CommercialGoal[]>(() => {
    const saved = localStorage.getItem('lumeo_crm_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id === 'goal-1' && parsed[0]?.targetValue === 50000) {
          localStorage.removeItem('lumeo_crm_goals');
          return [];
        }
        return parsed;
      } catch (e) { }
    }
    return DEFAULT_GOALS;
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<CommercialGoal | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommercialGoal['category']>('REVENUE');
  const [targetValue, setTargetValue] = useState('');
  const [period, setPeriod] = useState('Setembro 2026');
  const [deadline, setDeadline] = useState('2026-09-30');

  useEffect(() => {
    loadCRMData();
  }, []);

  useEffect(() => {
    localStorage.setItem('lumeo_crm_goals', JSON.stringify(goals));
  }, [goals]);

  const loadCRMData = async () => {
    try {
      const [leadsRes, compRes] = await Promise.all([
        api.leads.list(),
        api.companies.list()
      ]);
      setLeads(leadsRes.content || []);
      setCompanies(compRes.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Real calculations
  const totalRevenueWon = leads
    .filter(l => l.statusName?.toLowerCase().includes('ganho') || l.statusName?.toLowerCase().includes('qualificado'))
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const totalLeadsCount = leads.length;
  const totalClientsCount = companies.filter(c => c.isClient).length;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetValue) return;

    const newGoal: CommercialGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      category,
      targetValue: Number(targetValue) || 10,
      currentValue: 0,
      period,
      deadline
    };

    setGoals(prev => [newGoal, ...prev]);
    setShowModal(false);
    setTitle('');
    setTargetValue('');
  };

  const handleDeleteGoal = () => {
    if (!goalToDelete) return;
    setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
    setGoalToDelete(null);
  };

  const getGoalCurrentValue = (g: CommercialGoal) => {
    switch (g.category) {
      case 'REVENUE':
        return totalRevenueWon;
      case 'LEADS':
        return totalLeadsCount;
      case 'CLIENTS':
        return totalClientsCount;
      case 'PROPOSALS':
      default:
        return g.currentValue || 0;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            Metas Comerciais
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Acompanhe o desempenho de vendas e objetivos do time em tempo real
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>+ Nova Meta Comercial</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Receita Conquistada</div>
          <div className="stat-kpi-val">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRevenueWon)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Fechamento confirmado</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Oportunidades em Funil</div>
          <div className="stat-kpi-val">{totalLeadsCount} leads</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base ativa de negociação</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Clientes Ativos</div>
          <div className="stat-kpi-val">{totalClientsCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Contratos vigentes</div>
        </div>

        <div className="stat-kpi-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Metas Cadastradas</div>
          <div className="stat-kpi-val">{goals.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ciclo: Setembro 2026</div>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {goals.map(g => {
          const current = getGoalCurrentValue(g);
          const percent = Math.min(100, Math.round((current / (g.targetValue || 1)) * 100));

          const formatVal = (v: number) => {
            if (g.category === 'REVENUE') {
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
            }
            return `${v}`;
          };

          return (
            <div
              key={g.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Target size={16} color="var(--accent-coral)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {g.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Ciclo: {g.period} • Limite: {new Date(g.deadline).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setGoalToDelete(g)}
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
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Progress Bar & Values */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {formatVal(current)}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Meta: <strong>{formatVal(g.targetValue)}</strong>
                  </span>
                </div>

                <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: percent >= 100 ? '#10b981' : 'linear-gradient(90deg, #ff5722 0%, #ff8a65 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span>{percent}% atingido</span>
                  {percent >= 100 ? (
                    <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle size={12} /> Meta batida!
                    </span>
                  ) : (
                    <span>Faltam {formatVal(Math.max(0, g.targetValue - current))}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Meta */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Definir Meta Comercial
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Título da Meta *
                </label>
                <input
                  required
                  className="input"
                  placeholder="Ex: Faturamento Mensal Outubro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Tipo / Métrica
                  </label>
                  <select
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="REVENUE">Receita (R$)</option>
                    <option value="LEADS">Novos Leads</option>
                    <option value="CLIENTS">Novos Clientes</option>
                    <option value="PROPOSALS">Propostas</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Valor Alvo *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="input"
                    placeholder="50000"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Ciclo / Período
                  </label>
                  <input
                    className="input"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Data Limite
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Meta */}
      {goalToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Excluir Meta</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deseja realmente remover a meta <strong>{goalToDelete.title}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setGoalToDelete(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteGoal}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
