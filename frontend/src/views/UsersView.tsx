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
  const [roles, setRoles] = useState<RoleConfig[]>(() => permissionsService.getRoles());
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(() => {
    const list = permissionsService.getRoles();
    return list.length > 0 ? list[0] : null;
  });
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
    const rList = permissionsService.getRoles();
    setRoles(rList);
    if (!selectedRole && rList.length > 0) {
      setSelectedRole(rList[0]);
    }

    try {
      const [allRes, pendingRes] = await Promise.all([
        api.users.listAll().catch(() => []),
        api.users.listPending().catch(() => [])
      ]);
      let usersList: UserInfo[] = (allRes && allRes.length > 0) ? allRes : [
        {
          id: 1,
          name: 'Gabriel Castro',
          email: 'gabrielcastro.dev01@gmail.com',
          role: 'ADMIN',
          active: true,
          status: 'ACTIVE'
        }
      ];
      const hasGabriel = usersList.some(u =>
        (u.name && u.name.toLowerCase().includes('gabriel castro')) ||
        (u.email && u.email.toLowerCase().trim() === 'gabrielcastro.dev01@gmail.com')
      );
      if (!hasGabriel) {
        usersList = [
          {
            id: 1,
            name: 'Gabriel Castro',
            email: 'gabrielcastro.dev01@gmail.com',
            role: 'ADMIN',
            active: true,
            status: 'ACTIVE'
          },
          ...usersList
        ];
      } else {
        usersList = usersList.map(u => {
          if ((u.name && u.name.toLowerCase().includes('gabriel castro')) ||
              (u.email && u.email.toLowerCase().trim() === 'gabrielcastro.dev01@gmail.com')) {
            return { ...u, role: 'ADMIN', active: true, status: 'ACTIVE' };
          }
          return u;
        });
      }
      setAllUsers(usersList);
      setPendingUsers(pendingRes || []);
      if (onRefreshPendingCount) {
        onRefreshPendingCount();
      }
    } catch (err: any) {
      setAllUsers([
        {
          id: 1,
          name: 'Gabriel Castro',
          email: 'gabrielcastro.dev01@gmail.com',
          role: 'ADMIN',
          active: true,
          status: 'ACTIVE'
        }
      ]);
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

  // Função para verificar se é o usuário master intocável Gabriel Castro
  const isGabrielCastro = (u?: { name?: string; email?: string } | null) => {
    if (!u) return false;
    const email = (u.email || '').toLowerCase().trim();
    const name = (u.name || '').toLowerCase().trim();
    return email === 'gabrielcastro.dev01@gmail.com' ||
           (name.includes('gabriel castro') && (email.includes('gabrielcastro') || email.includes('gabriel@')));
  };

  // Alterar Cargo de um Usuário (Admin pode trocar de qualquer um, exceto Gabriel Castro)
  const handleChangeUserRole = async (targetUser: UserInfo, newRole: string) => {
    if (isGabrielCastro(targetUser)) {
      showToast('O usuário master Gabriel Castro é intocável e seu cargo não pode ser alterado.', 'error');
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

  // Excluir Usuário (Apenas Gabriel Castro é intocável. admin@empresa.com pode ser excluído)
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (isGabrielCastro(userToDelete)) {
      showToast('O usuário master Gabriel Castro é intocável e não pode ser excluído.', 'error');
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
    <div style={{ padding: '10px 16px', maxWidth: '1600px', margin: '0 auto', color: '#ffffff' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(30, 58, 95, 0.45)',
              border: '1px solid rgba(30, 58, 95, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#93c5fd'
            }}>
              <Users size={16} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Gestão de Equipe & Permissões
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Controle de acessos, convites e matriz de permissões em tempo real
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.78rem' }}
            title="Recarregar usuários"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.78rem' }}
          >
            <Mail size={14} />
            <span>Convidar por E-mail</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.78rem' }}
          >
            <UserPlus size={14} />
            <span>Criar direto</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {message && (
        <div style={{
          padding: '8px 14px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation: Usuários / Cargos */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'USERS' ? '2px solid var(--accent-coral)' : '2px solid transparent',
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'USERS' ? '700' : '500',
            color: activeTab === 'USERS' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          <Users size={14} />
          <span>Usuários ({allUsers.length})</span>
          {pendingUsers.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '1px 5px',
              borderRadius: 'var(--radius-xs)'
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
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'ROLES' ? '700' : '500',
            color: activeTab === 'ROLES' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-xs)'
          }}
        >
          <ShieldCheck size={14} />
          <span>Cargos & Permissões ({roles.length})</span>
        </button>
      </div>

      {/* ==================== ABA 1: USUÁRIOS ==================== */}
      {activeTab === 'USERS' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', maxHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 2 }}>
                  <th style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>E-mail</th>
                  <th style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Cargo</th>
                  <th style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  allUsers.map(user => {
                    const isUntouchable = isGabrielCastro(user);

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '8px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: 'var(--radius-sm)',
                              background: isUntouchable ? 'rgba(234, 179, 8, 0.2)' : 'rgba(30, 58, 95, 0.35)',
                              border: `1px solid ${isUntouchable ? '#eab308' : '#1e3a5f'}`,
                              color: isUntouchable ? '#eab308' : '#93c5fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.74rem'
                            }}>
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.82rem' }}>{user.name}</div>
                              {isUntouchable ? (
                                <span style={{ fontSize: '0.66rem', color: '#eab308', fontWeight: '700', letterSpacing: '0.02em' }}>
                                  Admin Master • Intocável
                                </span>
                              ) : user.role === 'ADMIN' ? (
                                <span style={{ fontSize: '0.66rem', color: '#93c5fd', fontWeight: '600' }}>
                                  Administrador
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {formatDisplayEmail(user.email)}
                        </td>

                        {/* Seletor de Cargo Dinâmico */}
                        <td style={{ padding: '8px 14px' }}>
                          {isUntouchable ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-xs)',
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: '#eab308',
                              border: '1px solid rgba(234, 179, 8, 0.3)',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}>
                              <Lock size={11} />
                              <span>ADMIN MASTER</span>
                            </span>
                          ) : (
                            <select
                              value={user.role || 'VENDEDOR'}
                              onChange={(e) => handleChangeUserRole(user, e.target.value)}
                              className="input"
                              style={{
                                padding: '3px 7px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#ffffff',
                                background: '#1c1f26',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 'var(--radius-xs)',
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

                        <td style={{ padding: '8px 14px' }}>
                          <span className={`badge ${user.active !== false ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 'var(--radius-xs)' }}>
                            {user.active !== false ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                          {isUntouchable ? (
                            <span style={{ fontSize: '0.72rem', color: '#eab308', fontStyle: 'italic', fontWeight: '600' }}>
                              Intocável
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
                                padding: '4px',
                                borderRadius: 'var(--radius-xs)'
                              }}
                              title={`Excluir ${user.name}`}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={14} />
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
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '12px', height: 'calc(100vh - 128px)', overflow: 'hidden' }}>
          {/* Lado Esquerdo: Lista de Cargos */}
          <div className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="var(--accent-coral)" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', margin: 0 }}>Cargos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRoleModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', padding: '3px 7px' }}
              >
                <Plus size={12} />
                <span>Novo Cargo</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {roles.map(r => {
                const isSelected = selectedRole?.id === r.id;
                const isAdmin = r.id === 'ADMIN';

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent-coral)' : 'rgba(255, 255, 255, 0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.82rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                        {r.name}
                      </span>
                      {isAdmin && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: '700',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#eab308'
                        }}>
                          Intocável
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.25' }}>
                      {r.description || 'Cargo personalizado do CRM'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado Direito: Matriz de 20 Permissões do Cargo Selecionado */}
          {selectedRole && (
            <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {/* Header do Cargo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                      Permissões: {selectedRole.name}
                    </h2>
                    {selectedRole.id === 'ADMIN' ? (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#eab308',
                        border: '1px solid rgba(234, 179, 8, 0.4)'
                      }}>
                        Acesso Total Permanente
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '600' }}>
                        Permissões Customizáveis
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>
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
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    <Trash2 size={12} />
                    <span>Excluir Cargo</span>
                  </button>
                )}
              </div>

              {/* Banner Informativo do Admin */}
              {selectedRole.id === 'ADMIN' && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  color: '#eab308',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <Lock size={15} />
                  <span>
                    O cargo Admin é intocável, está acima de tudo, tem todas as 20 permissões sempre ativas e bloqueadas para edição.
                  </span>
                </div>
              )}

              {/* Categorias e Toggles em Grid responsivo sem scroll de página */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '8px' }}>
                {Object.entries(groupedPermissions).map(([category, items]) => (
                  <div key={category} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-coral)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      {category}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-xs)',
                              background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '0.76rem', fontWeight: '500', color: isChecked ? '#ffffff' : 'var(--text-secondary)' }}>
                              {p.label}
                            </span>

                            {/* Toggle Switch Compact Myrmex Style */}
                            <div style={{
                              width: '28px',
                              height: '16px',
                              borderRadius: 'var(--radius-xs)',
                              background: isChecked ? '#10b981' : '#374151',
                              position: 'relative',
                              transition: 'background 0.2s',
                              opacity: isLocked ? 0.6 : 1,
                              flexShrink: 0
                            }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: 'var(--radius-xs)',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '2px',
                                left: isChecked ? '14px' : '2px',
                                transition: 'left 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
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
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '18px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '10px' }}>
              <AlertCircle size={18} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Confirmar Exclusão</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
              Deseja realmente remover o usuário <strong>{userToDelete.name}</strong>? Ele perderá imediatamente o acesso ao CRM.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary btn-sm"
                disabled={deletingUser}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingUser}
                className="btn btn-primary btn-sm"
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
