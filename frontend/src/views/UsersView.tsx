import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Lock,
  User
} from 'lucide-react';

interface UsersViewProps {
  onRefreshPendingCount?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onRefreshPendingCount }) => {
  const [pendingUsers, setPendingUsers] = useState<UserInfo[]>([]);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Novo Usuário
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('ADMIN');
  const [creatingUser, setCreatingUser] = useState(false);

  // Modal Confirmação de Exclusão
  const [userToDelete, setUserToDelete] = useState<UserInfo | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.users.listPending(),
        api.users.listAll()
      ]);
      setPendingUsers(pendingRes || []);
      setAllUsers(allRes || []);
      if (onRefreshPendingCount) {
        onRefreshPendingCount();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao carregar lista de usuários: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fechar modais com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setUserToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApprove = async (userId: number, userName: string) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      await api.users.approve(userId);
      setMessage({ type: 'success', text: `Usuário "${userName}" foi aprovado com sucesso como Administrador!` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao aprovar usuário: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number, userName: string) => {
    if (!window.confirm(`Tem certeza que deseja recusar o acesso de "${userName}"?`)) {
      return;
    }
    setActionLoading(userId);
    setMessage(null);
    try {
      await api.users.reject(userId);
      setMessage({ type: 'success', text: `Solicitação de "${userName}" foi recusada.` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao recusar usuário: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    setCreatingUser(true);
    try {
      await api.users.create({
        name: createName.trim(),
        email: createEmail.toLowerCase().trim(),
        password: createPassword,
        role: createRole
      });
      setMessage({ type: 'success', text: `Usuário "${createName.trim()}" criado com sucesso e já está ativo!` });
      setShowCreateModal(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('ADMIN');
      await loadData();
    } catch (err: any) {
      alert('Erro ao criar usuário: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setCreatingUser(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      await api.users.delete(userToDelete.id);
      setMessage({ type: 'success', text: `Usuário "${userToDelete.name}" foi excluído com sucesso.` });
      setUserToDelete(null);
      await loadData();
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setDeletingUser(false);
    }
  };

  const displayedUsers = activeTab === 'pending' ? pendingUsers : allUsers;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Usuários
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Gerencie os membros da equipe e aprovações de acesso
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>+ Criar usuário</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'all' ? '600' : '500',
            color: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={16} />
          <span>Todos os Usuários ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'pending' ? '600' : '500',
            color: activeTab === 'pending' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={16} />
          <span>Pendentes de Aprovação</span>
          {pendingUsers.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>E-mail</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Data de Cadastro</th>
                <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {activeTab === 'pending' ? 'Nenhuma solicitação pendente no momento.' : 'Nenhum usuário cadastrado.'}
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => {
                  const isPending = user.status === 'PENDING' || (!user.active && user.status !== 'REJECTED' && user.status !== 'DELETED');
                  const isDeleted = user.status === 'DELETED';
                  if (isDeleted) return null;

                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.82rem'
                          }}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} color="var(--text-muted)" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        {isPending ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b'
                          }}>
                            <Clock size={12} />
                            Pendente
                          </span>
                        ) : user.active ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981'
                          }}>
                            <CheckCircle2 size={12} />
                            Ativo
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444'
                          }}>
                            Inativo
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Recentemente'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApprove(user.id, user.name)}
                                disabled={actionLoading === user.id}
                                className="btn btn-primary"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  background: '#10b981',
                                  borderColor: '#10b981',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <UserCheck size={14} />
                                <span>{actionLoading === user.id ? 'Aprovando...' : 'Aprovar'}</span>
                              </button>

                              <button
                                onClick={() => handleReject(user.id, user.name)}
                                disabled={actionLoading === user.id}
                                className="btn btn-secondary"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  color: '#ef4444',
                                  borderColor: 'rgba(239, 68, 68, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <UserX size={14} />
                                <span>Recusar</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="btn btn-secondary"
                              title="Excluir usuário"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.8rem',
                                color: '#ef4444',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Excluir</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: + Criar Usuário (Admin) */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}>
                  <Plus size={18} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Criar Novo Usuário
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Nome completo
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  E-mail de acesso
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Senha temporária
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Perfil de Acesso
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <option value="ADMIN">Administrador (Acesso Total)</option>
                  <option value="VENDEDOR">Vendedor / Comercial</option>
                </select>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Usuários criados pelo administrador já entram ativos imediatamente.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {creatingUser ? (
                    <>
                      <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <span>Salvar e Ativar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão */}
      {userToDelete && (
        <div
          onClick={() => setUserToDelete(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Excluir Usuário
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Esta ação revogará todo o acesso deste usuário
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong> ({userToDelete.email})? Se houver leads atribuídos a ele, eles serão reatribuídos para você.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary"
                disabled={deletingUser}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingUser}
                className="btn btn-primary"
                style={{
                  background: '#ef4444',
                  borderColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {deletingUser ? (
                  <>
                    <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Confirmar Exclusão</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
