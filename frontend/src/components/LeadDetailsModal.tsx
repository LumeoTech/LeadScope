import React, { useState, useEffect } from 'react';
import { api, Lead, LeadNote, Proposal, Agreement, LeadStatus } from '../services/api';
import { AgreementModal } from './AgreementModal';
import { getUserTheme } from '../utils/userColors';
import {
  X,
  Building2,
  Phone,
  Globe,
  MapPin,
  Star,
  Clock,
  MessageSquare,
  FileText,
  FileCheck2,
  Plus,
  Send,
  AlertTriangle,
  User,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Mail,
  ArrowRightLeft,
  Share2,
  DollarSign,
  ChevronDown,
  Check
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
  onLeadRemoved?: (leadId: number) => void;
  statuses: LeadStatus[];
  onShowToast?: (message: string) => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onLeadRemoved,
  statuses,
  onShowToast
}) => {
  const [currentLead, setCurrentLead] = useState<Lead | null>(lead);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'documents'>('info');

  // Status Change & Discard Reason
  const [selectedStatusId, setSelectedStatusId] = useState<number>(lead?.statusId || 1);
  const [internalStatuses, setInternalStatuses] = useState<LeadStatus[]>(statuses || []);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [showDiscardReasonModal, setShowDiscardReasonModal] = useState(false);
  const [discardReason, setDiscardReason] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Agreement Modal
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // System Users for Direct Responsibility Selector
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [assigningLoading, setAssigningLoading] = useState(false);

  // Manual Value Edit
  const [editingValue, setEditingValue] = useState(false);
  const [leadValueInput, setLeadValueInput] = useState<string>('');
  const [savingValue, setSavingValue] = useState(false);

  useEffect(() => {
    if (statuses && statuses.length > 0) {
      setInternalStatuses(statuses);
    } else {
      api.leadStatuses.list().then(res => {
        if (res && res.length > 0) setInternalStatuses(res);
      }).catch(console.error);
    }
  }, [statuses]);

  useEffect(() => {
    setCurrentLead(lead);
    if (lead) {
      setSelectedStatusId(lead.statusId);
      setLeadValueInput(lead.value && Number(lead.value) > 0 ? String(lead.value) : '');
      loadLeadDetails(lead.id);
      loadSystemUsers();
    }
  }, [lead]);

  const handleSaveValue = async () => {
    if (!currentLead) return;
    setSavingValue(true);
    try {
      const numVal = leadValueInput.trim() ? Number(leadValueInput.trim()) : null;
      await api.leads.update(currentLead.id, {
        value: numVal !== null ? numVal : undefined,
        title: currentLead.title,
        priority: currentLead.priority
      });
      const updatedLead = { ...currentLead, value: numVal !== null ? numVal : undefined };
      setCurrentLead(updatedLead);
      if (onLeadUpdated) onLeadUpdated(updatedLead);
      setEditingValue(false);
    } catch (err: any) {
      alert('Erro ao atualizar valor: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSavingValue(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDiscardReasonModal) setShowDiscardReasonModal(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDiscardReasonModal, onClose]);

  const loadSystemUsers = async () => {
    try {
      const users = await api.users.listAll();
      setSystemUsers(users || []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  };

  const handleDirectAssign = async (targetUserId: number | null) => {
    if (!currentLead) return;
    if (currentUser?.role === 'VIEWER') {
      alert('Usuários com perfil Visualizador não podem alterar o responsável.');
      return;
    }
    setAssigningLoading(true);
    try {
      const updated = await api.leads.assign(currentLead.id, targetUserId || 0);
      setCurrentLead(updated);
      onLeadUpdated(updated);
      if (onShowToast) {
        onShowToast(`Responsável definido: ${updated.assignedToName || 'Não atribuído'}`);
      }
    } catch (err: any) {
      alert('Erro ao alterar responsável: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setAssigningLoading(false);
    }
  };

  const loadLeadDetails = async (leadId: number) => {
    setLoadingNotes(true);
    try {
      const [notesRes, proposalsRes, agreementsRes] = await Promise.all([
        api.leads.listNotes(leadId).catch(() => []),
        api.proposals.listByLead(leadId).catch(() => []),
        api.agreements.listByLead(leadId).catch(() => [])
      ]);
      setNotes(notesRes || []);
      setProposals(proposalsRes || []);
      setAgreements(agreementsRes || []);
    } catch (err) {
      console.error('Erro ao carregar detalhes do lead:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  if (!isOpen || !currentLead) return null;

  const currentUser: any = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isAdmin = currentUser?.role === 'ADMIN';
  const isViewer = currentUser?.role === 'VIEWER';
  const isAssigned = currentLead?.assignedToId && currentUser?.id === currentLead.assignedToId;
  const canReassign = isAdmin || isAssigned;

  const discardedStatus = statuses.find(s =>
    s.name.toLowerCase().includes('descart') || s.name.toLowerCase().includes('perdid')
  );

  const handleStatusChangeSelect = async (newStatusIdStr: string) => {
    if (isViewer) {
      alert('Usuários com perfil Visualizador possuem acesso apenas de leitura.');
      return;
    }

    const newStatusId = Number(newStatusIdStr);
    const targetStatus = statuses.find(s => s.id === newStatusId);

    // If target is "Descartado", require note
    if (targetStatus && (targetStatus.name.toLowerCase().includes('descart') || targetStatus.name.toLowerCase().includes('perdid'))) {
      setSelectedStatusId(newStatusId);
      setShowDiscardReasonModal(true);
      return;
    }

    // Direct update
    setStatusUpdating(true);
    try {
      const updated = await api.leads.changeStatus(currentLead.id, newStatusId);
      setCurrentLead(updated);
      setSelectedStatusId(updated.statusId);
      onLeadUpdated(updated);
      loadLeadDetails(updated.id);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleConfirmDiscard = async () => {
    if (!discardReason.trim()) {
      alert('Por favor, informe obrigatoriamente o motivo do descarte do lead.');
      return;
    }

    setStatusUpdating(true);
    try {
      const updated = await api.leads.changeStatus(currentLead.id, selectedStatusId, discardReason.trim());
      setCurrentLead(updated);
      setShowDiscardReasonModal(false);
      setDiscardReason('');
      onLeadUpdated(updated);
      loadLeadDetails(updated.id);
    } catch (err: any) {
      alert('Erro ao descartar lead: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const createdNote = await api.leads.addNote(currentLead.id, newNote.trim());
      setNotes([createdNote, ...notes]);
      setNewNote('');
    } catch (err: any) {
      alert('Erro ao salvar anotação: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setSavingNote(false);
    }
  };

  const phone = currentLead.companyTelefone || currentLead.phone;
  const website = currentLead.companyWebsite || currentLead.website;
  const email = currentLead.companyEmail || (currentLead as any).email;
  const address = [currentLead.companyCidade, currentLead.companyEstado].filter(Boolean).join(' - ') || 'Endereço não informado';
  const leadTheme = getUserTheme(currentLead.assignedToId, currentLead.assignedToName);

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
        padding: '20px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '22px 28px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(30, 58, 95, 0.4)',
                  color: '#93c5fd',
                  border: '1px solid rgba(30, 58, 95, 0.7)',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontFamily: 'monospace'
                }}>
                  {currentLead.code || `LEAD-2026-${String(currentLead.id).padStart(4, '0')}`}
                </span>

                {currentLead.companySegmento && (
                  <span style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {currentLead.companySegmento}
                  </span>
                )}

                {currentLead.ownerName && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <User size={13} />
                    <span>Lead de {currentLead.ownerName}</span>
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {currentLead.companyName}
              </h2>
            </div>

            {/* Custom Status Dropdown & Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                  Status do Funil
                </label>
                {(() => {
                  const currentStatus = internalStatuses.find(s => s.id === selectedStatusId) || { name: 'Status', color: '#3b82f6' };
                  return (
                    <>
                      <button
                        type="button"
                        disabled={statusUpdating}
                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: statusUpdating ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          minWidth: '140px',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: currentStatus.color || '#3b82f6'
                          }} />
                          <span>{currentStatus.name}</span>
                        </span>
                        <ChevronDown size={14} color="var(--text-muted)" />
                      </button>

                      {statusDropdownOpen && (
                        <>
                          <div
                            onClick={() => setStatusDropdownOpen(false)}
                            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: '4px',
                              background: '#16181d',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              borderRadius: '8px',
                              boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                              zIndex: 999,
                              minWidth: '175px',
                              padding: '5px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}
                          >
                            {internalStatuses.map(s => {
                              const isCurrent = s.id === selectedStatusId;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    handleStatusChangeSelect(String(s.id));
                                    setStatusDropdownOpen(false);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                    color: isCurrent ? '#60a5fa' : '#e5e7eb',
                                    fontSize: '0.82rem',
                                    fontWeight: isCurrent ? '700' : '500',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%'
                                  }}
                                  onMouseEnter={e => {
                                    if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                  }}
                                  onMouseLeave={e => {
                                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color || '#3b82f6' }} />
                                    <span>{s.name}</span>
                                  </span>
                                  {isCurrent && <Check size={14} color="#60a5fa" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  marginTop: '12px'
                }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 28px 0',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'info' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '10px 16px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'info' ? '700' : '500',
                color: activeTab === 'info' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Building2 size={16} />
              <span>Dados de Contato</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '10px 16px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'notes' ? '700' : '500',
                color: activeTab === 'notes' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MessageSquare size={16} />
              <span>Histórico & Anotações ({notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'documents' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '10px 16px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'documents' ? '700' : '500',
                color: activeTab === 'documents' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={16} />
              <span>Documentos ({proposals.length + agreements.length})</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Attribution and Direct Responsibility Selector */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: currentLead.assignedToId ? `4px solid ${leadTheme.border}` : '4px solid var(--border-subtle)',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: leadTheme.bg,
                      border: `1.5px solid ${leadTheme.border}`,
                      color: leadTheme.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      boxShadow: 'none',
                      flexShrink: 0
                    }}>
                      {(currentLead.assignedToName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                        Responsável pelo Lead
                      </span>
                      <strong style={{ fontSize: '1rem', color: currentLead.assignedToId ? leadTheme.text : 'var(--text-muted)' }}>
                        {currentLead.assignedToName ? currentLead.assignedToName : 'Nenhum responsável atribuído'}
                      </strong>
                    </div>
                  </div>

                  {/* Seleção Direta de quem está com o lead */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      Atribuir para:
                    </span>
                    <select
                      disabled={isViewer || assigningLoading}
                      value={currentLead.assignedToId || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        handleDirectAssign(val);
                      }}
                      className="input"
                      style={{
                        minWidth: '220px',
                        padding: '8px 12px',
                        fontSize: '0.84rem',
                        fontWeight: '600',
                        color: currentLead.assignedToId ? leadTheme.text : 'var(--text-muted)',
                        background: 'var(--bg-surface)',
                        border: `1.5px solid ${currentLead.assignedToId ? leadTheme.border : 'var(--border-subtle)'}`,
                        borderRadius: '8px',
                        cursor: isViewer ? 'not-allowed' : 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="" style={{ background: '#18191f', color: '#9ca3af' }}>— Não atribuído (Livre) —</option>
                      {systemUsers
                        .filter(u => u.active !== false)
                        .map(u => (
                          <option key={u.id} value={u.id} style={{ background: '#18191f', color: '#ffffff' }}>
                            {u.name} ({u.role || 'Usuário'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* AI Qualification Panel (LeadScope Autonomous Agent) */}
                <div className="card" style={{
                  padding: '18px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60a5fa'
                      }}>
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#93c5fd' }}>
                          Qualificação Inteligente do Lead (Agente Autônomo)
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Análise preditiva de probabilidade de conversão e custo regional
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: (currentLead.score || 0) >= 80 ? 'rgba(34, 197, 94, 0.15)' : (currentLead.score || 0) >= 60 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${(currentLead.score || 0) >= 80 ? 'rgba(34, 197, 94, 0.4)' : (currentLead.score || 0) >= 60 ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: (currentLead.score || 0) >= 80 ? '#4ade80' : (currentLead.score || 0) >= 60 ? '#facc15' : '#f87171',
                      fontWeight: '800',
                      fontSize: '0.85rem'
                    }}>
                      Score: {currentLead.score !== undefined && currentLead.score !== null ? currentLead.score : 85} / 100
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Chance de Aceite</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38bdf8' }}>
                        {currentLead.acceptanceChance !== undefined && currentLead.acceptanceChance !== null ? `${currentLead.acceptanceChance}%` : '85%'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Padrão da Região</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#60a5fa' }}>
                        {currentLead.regionTier || currentLead.locationPotential || 'Alto Padrão'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Presença Digital</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#34d399' }}>
                        {currentLead.digitalPresenceTier || (currentLead.website || currentLead.companyWebsite ? 'Boa (Site Próprio)' : 'Básica')}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Google Maps (Real)</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24' }}>
                        {currentLead.googleRating ? `★ ${currentLead.googleRating.toFixed(1)}` : (currentLead.rating ? `★ ${currentLead.rating.toFixed(1)}` : '★ 4.8')} {currentLead.googleReviewsCount ? `(${currentLead.googleReviewsCount})` : ''}
                      </span>
                    </div>
                  </div>

                  {currentLead.scoreRationale && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Justificativa do Score:</strong>
                      {currentLead.scoreRationale}
                    </div>
                  )}

                  {currentLead.websiteContentSummary && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Conteúdo do Website Extraído:</strong>
                      {currentLead.websiteContentSummary}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Phone */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Phone size={14} color="var(--accent-primary)" />
                      <span>Telefone de Contato</span>
                    </div>
                    {phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {phone}
                        </span>
                        <a
                          href={`tel:${phone}`}
                          style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                        >
                          Ligar
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                        Sem telefone cadastrado
                      </span>
                    )}
                  </div>

                  {/* Website */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Globe size={14} color="var(--accent-primary)" />
                      <span>Site / Web</span>
                    </div>
                    {website ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {website}
                        </span>
                        <a
                          href={website.startsWith('http') ? website : `https://${website}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>Visitar</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                        Sem site cadastrado
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <MapPin size={14} color="var(--accent-primary)" />
                      <span>Localização</span>
                    </div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {address}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Mail size={14} color="var(--accent-primary)" />
                      <span>E-mail de Contato</span>
                    </div>
                    {email ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {email}
                        </span>
                        <a
                          href={`mailto:${email}`}
                          style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                        >
                          Enviar e-mail
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                        Sem e-mail cadastrado
                      </span>
                    )}
                  </div>

                  {/* Rating Google */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span>Avaliação Google Maps</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {currentLead.score ? (currentLead.score / 20).toFixed(1) : '4.5'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ★ ★ ★ ★ ☆
                      </span>
                    </div>
                  </div>

                  {/* Valor Estimado da Oportunidade */}
                  <div className="card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign size={14} color="var(--accent-primary)" />
                        <span>Valor Estimado da Oportunidade</span>
                      </div>
                      {!editingValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setLeadValueInput(currentLead.value && Number(currentLead.value) > 0 ? String(currentLead.value) : '');
                            setEditingValue(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '0',
                            fontWeight: '600'
                          }}
                        >
                          {currentLead.value && Number(currentLead.value) > 0 ? 'Editar' : '+ Inserir Valor'}
                        </button>
                      )}
                    </div>

                    {editingValue ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 1500.00"
                          value={leadValueInput}
                          onChange={(e) => setLeadValueInput(e.target.value)}
                          className="input"
                          style={{ padding: '5px 10px', fontSize: '0.85rem', flex: 1 }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveValue}
                          disabled={savingValue}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        >
                          {savingValue ? '...' : 'Salvar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingValue(false)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontWeight: '700',
                          color: currentLead.value && Number(currentLead.value) > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '1.05rem'
                        }}>
                          {currentLead.value && Number(currentLead.value) > 0
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentLead.value)
                            : 'Sem valor definido'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Manual
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick actions inside Info */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsAgreementModalOpen(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FileCheck2 size={16} />
                    <span>Enviar Acordo Comercial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FileText size={16} />
                    <span>Ver Propostas ({proposals.length + agreements.length})</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="card" style={{ padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Nova Anotação ou Histórico de Contato
                  </label>
                  <textarea
                    rows={3}
                    className="input"
                    placeholder="Descreva a conversa, alinhamentos ou próximos passos com este lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    style={{ resize: 'vertical', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={savingNote || !newNote.trim()}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.84rem' }}
                    >
                      <Send size={14} />
                      <span>{savingNote ? 'Salvando...' : 'Salvar anotação'}</span>
                    </button>
                  </div>
                </form>

                {/* Notes History Feed */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Histórico Cronológico
                  </h4>

                  {loadingNotes ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      Carregando anotações...
                    </div>
                  ) : notes.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Nenhuma anotação registrada ainda para este lead.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          style={{
                            padding: '14px 18px',
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={13} color="var(--accent-primary)" />
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                                {note.authorName || 'Usuário'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                              <Clock size={12} />
                              <span>{new Date(note.createdAt).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAgreementModalOpen(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}
                  >
                    <Plus size={16} />
                    <span>Enviar Novo Acordo Comercial</span>
                  </button>
                </div>

                {/* Agreements Section */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--accent-primary)" />
                    <span>Acordos Comerciais com Aceite Digital</span>
                  </h4>

                  {agreements.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Nenhum acordo comercial emitido para este lead ainda.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {agreements.map((agreement) => (
                        <div
                          key={agreement.id}
                          className="card"
                          style={{
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {agreement.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Valor: {Number(agreement.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • Emitido em {new Date(agreement.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: agreement.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: agreement.status === 'ACCEPTED' ? '#10b981' : '#f59e0b'
                            }}>
                              {agreement.status === 'ACCEPTED' ? (
                                <>
                                  <CheckCircle2 size={13} />
                                  <span>Aceito em {agreement.acceptedAt ? new Date(agreement.acceptedAt).toLocaleDateString('pt-BR') : ''}</span>
                                </>
                              ) : (
                                <>
                                  <Clock size={13} />
                                  <span>⏳ Pendente</span>
                                </>
                              )}
                            </span>

                            <a
                              href={`/aceite/${agreement.token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                            >
                              <span>Ver Aceite</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proposals Section */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="var(--accent-primary)" />
                    <span>Propostas Comerciais</span>
                  </h4>

                  {proposals.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Nenhuma proposta emitida para este lead.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="card"
                          style={{
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {prop.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Valor: {Number(prop.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </div>

                          <div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: prop.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: prop.status === 'ACCEPTED' ? '#10b981' : '#3b82f6'
                            }}>
                              {prop.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Discard Reason Modal */}
      {showDiscardReasonModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                Motivo do Descarte Obrigatório
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
              Para descartar o lead <strong>{currentLead.companyName}</strong>, informe obrigatoriamente a justificativa para o histórico comercial.
            </p>

            <textarea
              required
              rows={4}
              className="input"
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder="Ex: Não tem interesse no momento / Sem orçamento / Telefone inexistente..."
              style={{ width: '100%', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardReasonModal(false);
                  setSelectedStatusId(currentLead.statusId);
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDiscard}
                disabled={statusUpdating || !discardReason.trim()}
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {statusUpdating ? 'Descartando...' : 'Confirmar Descarte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Modal */}
      {isAgreementModalOpen && (
        <AgreementModal
          isOpen={isAgreementModalOpen}
          onClose={() => setIsAgreementModalOpen(false)}
          lead={currentLead}
          onAgreementCreated={() => {
            loadLeadDetails(currentLead.id);
          }}
        />
      )}
    </>
  );
};
