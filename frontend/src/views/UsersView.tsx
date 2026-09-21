import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import {
  permissionsService,
  RoleConfig,
  RolePermissions,
  ALL_PERMISSIONS_KEYS
} from '../services/permissionsService';
import {
  Users,
  Shield,
  ShieldCheck,
  Mail,
  UserPlus,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';

interface UsersViewProps {
  onRefreshPendingCount?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onRefreshPendingCount }) => {
  const [currentUser] = useState<UserInfo | null>(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Convidar Usuário por E-mail (Supabase)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('VENDEDOR');
  const [invitingUser, setInvitingUser] = useState(false);

  // Modal Criar Direto
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('VENDEDOR');
  const [creatingUser, setCreatingUser] = useState(false);

  // Modal Novo Cargo
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Modal Exclusão de Usuário
  const [userToDelete, setUserToDelete] = useState<UserInfo | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Feedback toast
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.users.listAll(),
        api.users.listPending().catch(() => [])
      ]);
      setAllUsers(allRes || []);
      setPendingUsers(pendingRes || []);
      const rList = permissionsService.getRoles();
      setRoles(rList);
      if (!selectedRole && rList.length > 0) {
        setSelectedRole(rList[0]);
      }
      if (onRefreshPendingCount) {
        onRefreshPendingCount();
      }
    } catch (err: any) {
      showToast('Erro ao carregar dados: ' + (err.message || 'Falha de conexão'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handlePermChange = () => {
      const updated = permissionsService.getRoles();
      setRoles(updated);
      setSelectedRole(prev => (prev ? updated.find(r => r.id === prev.id) || updated[0] : updated[0]));
    };
    window.addEventListener('lumeo_permissions_changed', handlePermChange);
    return () => window.removeEventListener('lumeo_permissions_changed', handlePermChange);
  }, []);

  // Guarda de acesso: Team só é visível para Admin
  if (currentUser && currentUser.role !== 'ADMIN') {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Shield size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Acesso Restrito
        </h2>
        <p style={{ fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Apenas Administradores têm permissão para acessar a gestão de equipe e permissões.
        </p>
      </div>
    );
  }

  // Tratamento do placeholder neutro para email de admin
  const formatDisplayEmail = (email?: string) => {
    if (!email) return 'admin@empresa.com';
    if (email === 'admin@crmscanner.com') return 'admin@empresa.com';
    return email;
  };

  // Alterar Cargo de um Usuário (Admin pode trocar de qualquer um, exceto outro Admin)
  const handleChangeUserRole = async (targetUser: UserInfo, newRole: string) => {
    if (targetUser.role === 'ADMIN') {
      showToast('O cargo de um Administrador é intocável e não pode ser alterado.', 'error');
      return;
    }

    try {
      await api.users.updateRole(targetUser.id, newRole);
      setAllUsers(prev => prev.map(u => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      showToast(`Cargo de ${targetUser.name} atualizado para ${newRole}. Permissões ativas imediatamente!`);
    } catch (e: any) {
      showToast('Erro ao atualizar cargo: ' + (e.message || 'Falha na requisição'), 'error');
    }
  };

  // Convidar por E-mail (Supabase Auth inviteUserByEmail)
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showToast('Digite um e-mail válido para envio do convite.', 'error');
      return;
    }

    setInvitingUser(true);
    try {
      await api.users.invite({
        email: inviteEmail.toLowerCase().trim(),
        name: inviteName.trim() || inviteEmail.split('@')[0],
        role: inviteRole
      });
      showToast(`Convite enviado via Supabase Auth para ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('VENDEDOR');
      await loadData();
    } catch (err: any) {
      showToast('Erro ao enviar convite: ' + (err.message || 'Falha ao convidar'), 'error');
    } finally {
      setInvitingUser(false);
    }
  };

  // Criar Direto
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      showToast('Preencha nome, email e senha temporária.', 'error');
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
      showToast(`Usuário "${createName.trim()}" criado com sucesso e ativo no sistema!`);
      setShowCreateModal(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('VENDEDOR');
      await loadData();
    } catch (err: any) {
      showToast('Erro ao criar usuário: ' + (err.message || 'Falha na criação'), 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  // Excluir Usuário (Admin é intocável)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'ADMIN') {
      showToast('O usuário Administrador é intocável e não pode ser excluído.', 'error');
      setUserToDelete(null);
      return;
    }

    setDeletingUser(true);
    try {
      await api.users.delete(userToDelete.id);
      showToast(`Usuário "${userToDelete.name}" foi excluído com sucesso.`);
      setUserToDelete(null);
      await loadData();
    } catch (err: any) {
      showToast('Erro ao excluir usuário: ' + (err.message || 'Falha na exclusão'), 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  // Criar Novo Cargo
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Digite o nome do novo cargo.', 'error');
      return;
    }

    const created = permissionsService.createRole(newRoleName, newRoleDesc);
    showToast(`Cargo "${created.name}" criado com sucesso!`);
    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedRole(created);
  };

  // Alternar Toggle Individual de Permissão
  const handleTogglePermission = (permissionKey: keyof RolePermissions) => {
    if (!selectedRole) return;
    if (selectedRole.id === 'ADMIN') {
      showToast('O cargo Admin é intocável. Todas as suas permissões são permanentemente ativas.', 'error');
      return;
    }

    const currentVal = Boolean(selectedRole.permissions[permissionKey]);
    const updated = !currentVal;
    permissionsService.updatePermissions(selectedRole.id, { [permissionKey]: updated });
    showToast(`Permissão "${permissionKey}" ${updated ? 'ativada' : 'desativada'} para ${selectedRole.name}.`);
  };

  // Agrupamento de permissões por categoria
  const groupedPermissions = ALL_PERMISSIONS_KEYS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS_KEYS>);

  return (
    <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-coral)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Gestão de Equipe & Permissões
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Controle de acessos, convites e matriz de permissões em tempo real
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Recarregar usuários"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Mail size={16} />
            <span>Convidar por E-mail</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} />
            <span>Criar direto</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.88rem',
          fontWeight: '500'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation: Usuários / Cargos */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'USERS' ? '2px solid var(--accent-coral)' : '2px solid transparent',
            padding: '8px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'USERS' ? '700' : '500',
            color: activeTab === 'USERS' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} />
          <span>Usuários ({allUsers.length})</span>
          {pendingUsers.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {pendingUsers.length} pendentes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ROLES')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ROLES' ? '2px solid var(--accent-coral)' : '2px solid transparent',
            padding: '8px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'ROLES' ? '700' : '500',
            color: activeTab === 'ROLES' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={16} />
          <span>Cargos & Permissões ({roles.length})</span>
        </button>
      </div>

      {/* ==================== ABA 1: USUÁRIOS ==================== */}
      {activeTab === 'USERS' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>E-mail</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cargo</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  allUsers.map(user => {
                    const isAdmin = user.role === 'ADMIN';

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isAdmin ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                              border: `1px solid ${isAdmin ? '#eab308' : '#818cf8'}`,
                              color: isAdmin ? '#eab308' : '#818cf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.8rem'
                            }}>
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                              {isAdmin && (
                                <span style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: '600' }}>
                                  Admin Intocável
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {formatDisplayEmail(user.email)}
                        </td>

                        {/* Seletor de Cargo Dinâmico */}
                        <td style={{ padding: '14px 20px' }}>
                          {isAdmin ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: '#eab308',
                              border: '1px solid rgba(234, 179, 8, 0.3)',
                              fontSize: '0.78rem',
                              fontWeight: '700'
                            }}>
                              <Lock size={12} />
                              <span>ADMIN</span>
                            </span>
                          ) : (
                            <select
                              value={user.role || 'VENDEDOR'}
                              onChange={(e) => handleChangeUserRole(user, e.target.value)}
                              className="input"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                background: '#1c1f26',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                              title="Trocar cargo do usuário (entra em vigor imediatamente)"
                            >
                              {roles.map(r => (
                                <option key={r.id} value={r.id} style={{ background: '#18191f', color: '#ffffff' }}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span className={`badge ${user.active !== false ? 'badge-success' : 'badge-warning'}`}>
                            {user.active !== false ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {isAdmin ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Protegido
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px'
                              }}
                              title={`Excluir ${user.name}`}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ABA 2: CARGOS & PERMISSÕES ==================== */}
      {activeTab === 'ROLES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '20px', alignItems: 'flex-start' }}>
          {/* Lado Esquerdo: Lista de Cargos */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent-coral)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Cargos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRoleModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>Novo Cargo</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map(r => {
                const isSelected = selectedRole?.id === r.id;
                const isAdmin = r.id === 'ADMIN';

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent-coral)' : 'rgba(255, 255, 255, 0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {r.name}
                      </span>
                      {isAdmin && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308'
                        }}>
                          Intocável
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      {r.description || 'Cargo personalizado do CRM'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado Direito: Matriz de 20 Permissões do Cargo Selecionado */}
          {selectedRole && (
            <div className="card" style={{ padding: '24px' }}>
              {/* Header do Cargo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                      Permissões: {selectedRole.name}
                    </h2>
                    {selectedRole.id === 'ADMIN' ? (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#eab308',
                        border: '1px solid rgba(234, 179, 8, 0.4)'
                      }}>
                        Acesso Total Permanente
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: '600' }}>
                        Permissões Customizáveis
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
                    {selectedRole.description}
                  </p>
                </div>

                {selectedRole.id !== 'ADMIN' && !selectedRole.isSystem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Deseja realmente excluir o cargo "${selectedRole.name}"?`)) {
                        permissionsService.deleteRole(selectedRole.id);
                        showToast(`Cargo "${selectedRole.name}" excluído.`);
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={13} />
                    <span>Excluir Cargo</span>
                  </button>
                )}
              </div>

              {/* Banner Informativo do Admin */}
              {selectedRole.id === 'ADMIN' && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  color: '#eab308',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <Lock size={18} />
                  <span>
                    O cargo Admin é intocável, está acima de tudo, tem todas as 20 permissões sempre ativas e bloqueadas para edição.
                  </span>
                </div>
              )}

              {/* Categorias e Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {Object.entries(groupedPermissions).map(([category, items]) => (
                  <div key={category} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-coral)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                      {category}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                      {items.map(p => {
                        const isChecked = selectedRole.id === 'ADMIN' ? true : Boolean(selectedRole.permissions[p.key]);
                        const isLocked = selectedRole.id === 'ADMIN';

                        return (
                          <div
                            key={p.key}
                            onClick={() => !isLocked && handleTogglePermission(p.key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '0.84rem', fontWeight: '500', color: isChecked ? '#ffffff' : 'var(--text-secondary)' }}>
                              {p.label}
                            </span>

                            {/* Toggle Switch */}
                            <div style={{
                              width: '36px',
                              height: '20px',
                              borderRadius: '12px',
                              background: isChecked ? '#10b981' : '#374151',
                              position: 'relative',
                              transition: 'background 0.2s',
                              opacity: isLocked ? 0.6 : 1
                            }}>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: isChecked ? '18px' : '2px',
                                transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL: CONVIDAR POR E-MAIL ==================== */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Convidar por E-mail</h3>
              </div>
              <button type="button" onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              O convite será enviado diretamente via Supabase Auth. Ao aceitar o convite, o usuário define sua senha e entra no CRM com o cargo escolhido.
            </p>

            <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  E-mail do Convidado *
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome de exibição (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Nome do colaborador"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Cargo Inicial *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="select"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={invitingUser} className="btn btn-primary">
                  {invitingUser ? 'Enviando convite...' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CRIAR DIRETO ==================== */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Criar Usuário Direto</h3>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do usuário"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Senha Temporária *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Cargo *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="select"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={creatingUser} className="btn btn-primary">
                  {creatingUser ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: NOVO CARGO ==================== */}
      {showNewRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--accent-coral)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Criar Novo Cargo</h3>
              </div>
              <button type="button" onClick={() => setShowNewRoleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome do Cargo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Closer, Coordenador, SDR Lead"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Descrição das Atribuições
                </label>
                <textarea
                  rows={3}
                  placeholder="Breve descrição da função no CRM"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowNewRoleModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Cargo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EXCLUIR USUÁRIO ==================== */}
      {userToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '14px' }}>
              <AlertCircle size={22} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Confirmar Exclusão</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Deseja realmente remover o usuário <strong>{userToDelete.name}</strong>? Ele perderá imediatamente o acesso ao CRM.
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
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {deletingUser ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
