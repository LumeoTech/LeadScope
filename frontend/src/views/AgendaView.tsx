import React, { useEffect, useState } from 'react';
import { api, Activity, Lead } from '../services/api';
import {
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  Video,
  Phone,
  Mail,
  MessageSquare,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal Novo Agendamento
  const [showModal, setShowModal] = useState(false);
  const [leadId, setLeadId] = useState<number | ''>('');
  const [type, setType] = useState('REUNIAO');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [description, setDescription] = useState('');

  // Modal Exclusão
  const [actToDelete, setActToDelete] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const [actRes, leadsRes] = await Promise.all([
        api.activities.listUpcoming(),
        api.leads.list(),
      ]);
      setActivities(actRes || []);
      setLeads(leadsRes.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !title) return;

    try {
      await api.activities.create({
        leadId: Number(leadId),
        type,
        title,
        scheduledAt: scheduledAt || undefined,
        description,
      });
      setShowModal(false);
      setTitle('');
      setScheduledAt('');
      setDescription('');
      loadAgenda();
    } catch (e: any) {
      alert(e.message || 'Erro ao agendar compromisso');
    }
  };

  const handleMarkDone = async (id: number) => {
    try {
      await api.activities.markDone(id);
      loadAgenda();
    } catch (e: any) {
      alert(e.message || 'Erro ao concluir compromisso');
    }
  };

  const handleDeleteActivity = async () => {
    if (!actToDelete) return;
    setDeleting(true);
    try {
      await api.activities.delete(actToDelete.id);
      setActToDelete(null);
      loadAgenda();
    } catch (e: any) {
      alert('Erro ao excluir compromisso: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setDeleting(false);
    }
  };

  const filteredActivities = activities.filter(a => {
    if (filterType === 'ALL') return true;
    return a.type === filterType;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)' }}>
            Agenda & Compromissos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Reuniões, demonstrações, ligações e tarefas agendadas
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>+ Agendar Compromisso</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: `Todos (${activities.length})` },
          { key: 'REUNIAO', label: 'Reuniões' },
          { key: 'LIGACAO', label: 'Ligações' },
          { key: 'WHATSAPP', label: 'WhatsApp' },
          { key: 'EMAIL', label: 'E-mails' },
          { key: 'TAREFA', label: 'Tarefas' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: filterType === tab.key ? 'var(--btn-primary-bg)' : 'var(--bg-surface)',
              color: filterType === tab.key ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredActivities.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum compromisso pendente com este filtro.
          </div>
        ) : (
          filteredActivities.map(act => (
            <div key={act.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: act.type === 'REUNIAO' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 87, 34, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {act.type === 'REUNIAO' ? <Video size={22} color="#818cf8" /> : <Clock size={22} color="var(--accent-coral)" />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">{act.type}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{act.title}</h3>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Oportunidade: <strong>{act.leadTitle}</strong> | Responsável: {act.userName}
                  </div>
                  {act.description && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {act.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {act.scheduledAt && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24' }}>
                      {new Date(act.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(act.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}

                <button onClick={() => handleMarkDone(act.id)} className="btn btn-success btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} />
                  <span>Concluir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActToDelete(act)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px', color: 'var(--text-muted)' }}
                  title="Excluir compromisso"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Agendar Reunião */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '18px', color: 'var(--text-primary)' }}>Agendar Compromisso Comercial</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lead Vinculado *</label>
                <select
                  required
                  className="select"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Selecione a oportunidade...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.companyRazaoSocial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Título do Compromisso *</label>
                <input
                  required
                  className="input"
                  placeholder="Ex: Apresentação da Proposta Comercial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tipo de Ação</label>
                  <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="REUNIAO">Reunião / Demo</option>
                    <option value="LIGACAO">Ligação Telefônica</option>
                    <option value="WHATSAPP">Contato WhatsApp</option>
                    <option value="EMAIL">E-mail Comercial</option>
                    <option value="TAREFA">Tarefa Interna</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Data e Hora</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Pauta / Observações</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Pontos chave a serem tratados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Agendamento */}
      {actToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Excluir Compromisso</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deseja realmente remover o compromisso <strong>{actToDelete.title}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActToDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteActivity}
                disabled={deleting}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
