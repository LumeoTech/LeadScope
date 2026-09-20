import React, { useState, useEffect } from 'react';
import { UserInfo, api } from '../services/api';
import { LumeoLogo } from './LumeoLogo';
import {
  LogOut,
  Sun,
  Moon,
  Bell,
  CornerUpRight,
  UserPlus,
  Sliders,
  Check,
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';

interface NavbarProps {
  user: UserInfo | null;
  onLogout: () => void;
  onNavigateTab?: (tab: any) => void;
  pendingUsersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNavigateTab,
  pendingUsersCount = 0
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [systemUsers, setSystemUsers] = useState<UserInfo[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);

  useEffect(() => {
    const saved = (localStorage.getItem('crm_theme') as 'dark' | 'light') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    loadUsers();
    loadNotifications();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await api.users.listAll();
      setSystemUsers(usersList || []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await api.notifications.list();
      setSystemNotifications(notifs || []);
    } catch (e) {
      // silent
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = ['#2563eb', '#7c3aed', '#ec4899', '#059669', '#d97706'];

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-header)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Brand: lumeo TECH */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <LumeoLogo size={28} showText={true} />
      </div>

      {/* Right side Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Forward / Share Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleShare}
            title="Copiar link do sistema"
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: copiedLink ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {copiedLink ? <Check size={15} /> : <CornerUpRight size={15} />}
          </button>

          {copiedLink && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: '600',
              color: '#10b981',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)'
            }}>
              Link copiado!
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notificações do sistema"
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <Bell size={15} />
            {(pendingUsersCount > 0 || systemNotifications.some(n => !n.isRead)) && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ff5722',
                boxShadow: '0 0 6px #ff5722'
              }}></span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '320px',
              maxHeight: '380px',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Notificações</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>

              {pendingUsersCount > 0 && (
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigateTab) onNavigateTab('users');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 87, 34, 0.08)',
                    border: '1px solid rgba(255, 87, 34, 0.2)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#ff5722', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{pendingUsersCount} Solicitação(ões) Pendente(s)</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Clique para revisar os novos acessos de administrador.
                  </div>
                </div>
              )}

              {systemNotifications.length > 0 ? (
                systemNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={async () => {
                      if (!notif.isRead) {
                        try {
                          await api.notifications.markAsRead(notif.id);
                          setSystemNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                        } catch (e) {}
                      }
                      setShowNotifications(false);
                      if (onNavigateTab) onNavigateTab('kanban');
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                      border: notif.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.2)',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {notif.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {notif.message}
                    </div>
                  </div>
                ))
              ) : pendingUsersCount === 0 && (
                <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Nenhuma notificação nova no momento.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real Users Avatar Stack */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('users')}
          title="Ver todos os usuários da equipe"
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '4px' }}
        >
          {systemUsers.length > 0 ? (
            systemUsers.slice(0, 3).map((u, i) => (
              <div
                key={u.id}
                title={`${u.name} (${u.role})`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: avatarColors[i % avatarColors.length],
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)',
                  marginLeft: i > 0 ? '-8px' : '0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }}
              >
                {getInitials(u.name)}
              </div>
            ))
          ) : (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user ? getInitials(user.name) : 'AD'}
            </div>
          )}

          {systemUsers.length > 3 && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '0.68rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-surface)',
              marginLeft: '-8px'
            }}>
              +{systemUsers.length - 3}
            </div>
          )}
        </div>

        {/* User Plus Button */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('users')}
          title="Gerenciar usuários e convites"
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <UserPlus size={15} />
        </button>

        {/* Customize Widget Button */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('kanban')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
        >
          <Sliders size={14} />
          <span>Customize Widget</span>
        </button>

        {/* Theme Toggle (Sol / Lua) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#fbbf24" />
              <span style={{ fontSize: '11px', fontWeight: '600' }}>Claro</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#6366f1" />
              <span style={{ fontSize: '11px', fontWeight: '600' }}>Escuro</span>
            </>
          )}
        </button>

        {/* Current User & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
            <div
              title={`${user.name} (${user.role})`}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.78rem'
              }}
            >
              {getInitials(user.name)}
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 8px', color: 'var(--text-muted)' }}
              title="Encerrar Sessão"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
