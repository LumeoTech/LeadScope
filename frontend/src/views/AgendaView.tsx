import React, { useEffect, useState } from 'react';
import { api, Activity, Lead, UserInfo } from '../services/api';
import { permissionsService } from '../services/permissionsService';
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
  X,
  AlertCircle
} from 'lucide-react';

export const AgendaView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

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

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Re-render when permissions update
  const [, setPermissionsTick] = useState(0);
  useEffect(() => {
    const handlePermChange = () => setPermissionsTick(t => t + 1);
    window.addEventListener('lumeo_permissions_changed', handlePermChange);
    return () => window.removeEventListener('lumeo_permissions_changed', handlePermChange);
  }, []);

  const userRole = currentUser?.role || 'VENDEDOR';
  const canCreateAgenda = permissionsService.hasPermission(userRole, 'can_create_agenda');

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
    } catch (e: any) {
      showToast('Erro ao carregar agenda: ' + (e.message || 'Falha de conexão'), 'error');
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
      showToast('Compromisso agendado com sucesso!', 'success');
      loadAgenda();
    } catch (e: any) {
      showToast(e.message || 'Erro ao agendar compromisso', 'error');
    }
  };

  const handleMarkDone = async (id: number) => {
    try {
      await api.activities.markDone(id);
      showToast('Compromisso concluído com sucesso!', 'success');
      loadAgenda();
    } catch (e: any) {
      showToast(e.message || 'Erro ao concluir compromisso', 'error');
    }
  };

  const handleDeleteActivity = async () => {
    if (!actToDelete) return;
    setDeleting(true);
    try {
      await api.activities.delete(actToDelete.id);
      showToast('Compromisso excluído com sucesso!', 'success');
      setActToDelete(null);
      loadAgenda();
    } catch (e: any) {
      showToast('Erro ao excluir compromisso: ' + (e.message || 'Erro desconhecido'), 'error');
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
      {/* Toast Notification */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '10px',
            background: feedback.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
            fontSize: '0.88rem',
            fontWeight: '500',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#f87171" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)' }}>
            Agenda & Compromissos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Reuniões, demonstrações, ligações e tarefas agendadas
          </p>
        </div>

        {canCreateAgenda && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} />
            <span>+ Agendar Compromisso</span>
          </button>
        )}
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
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={44} style={{ opacity: 0.35, marginBottom: '12px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Nenhum compromisso agendado
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '0.88rem' }}>
              Organize reuniões, demonstrações, ligações e follow-ups com seus leads e clientes em um só lugar.
            </p>
            {canCreateAgenda && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Agendar agora</span>
              </button>
            )}
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

      {/* Modal: Agendar Compromisso */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Agendar Compromisso</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Oportunidade *</label>
                <select
                  required
                  className="select"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Selecione a oportunidade...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.title} ({l.companyRazaoSocial})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tipo *</label>
                  <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="REUNIAO">Reunião / Demo</option>
                    <option value="LIGACAO">Ligação Telefônica</option>
                    <option value="WHATSAPP">Contato WhatsApp</option>
                    <option value="EMAIL">Envio de Proposta / E-mail</option>
                    <option value="TAREFA">Tarefa Interna</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Data e Horário</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Descrição / Pauta</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Objetivos da reunião, links de sala de vídeo, etc."
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

      {/* Modal: Confirmar Exclusão de Atividade */}
      {actToDelete && (
        <div className="modal-overlay" onClick={() => setActToDelete(null)}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Excluir Compromisso</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
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
