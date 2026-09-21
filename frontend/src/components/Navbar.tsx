import React, { useState, useEffect, useRef } from 'react';
import { UserInfo, api } from '../services/api';
import {
  LogOut,
  Bell,
  Users,
  ShieldCheck,
  Clock,
  X,
  User,
  Settings,
  HelpCircle,
  Sparkles
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const notifs = await api.notifications.list();
      setSystemNotifications(notifs || []);
    } catch (e) {
      // silent
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const unreadNotifsCount = systemNotifications.filter(n => !n.isRead).length;
  const totalBadgeCount = pendingUsersCount + unreadNotifsCount;

  return (
    <header
      style={{
        height: '56px',
        padding: '12px 36px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background: 'transparent',
        zIndex: 90,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* ==================== NOTIFICATIONS (BELL WITH BADGE) ==================== */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notificações"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#16181b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c93a0',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            <Bell size={16} />

            {/* Real badge count: only shown if there are real unread notifications or pending users */}
            {totalBadgeCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '1.5px solid #0c0d0f',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px'
                }}
              >
                {totalBadgeCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                maxHeight: '380px',
                overflowY: 'auto',
                background: '#16181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Notificações</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'none', border: 'none', color: '#68707d', cursor: 'pointer', padding: '2px' }}
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
                    borderRadius: '8px',
                    background: 'rgba(255, 87, 34, 0.08)',
                    border: '1px solid rgba(255, 87, 34, 0.25)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    color: '#ffffff'
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#ff5722', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} />
                    <span>{pendingUsersCount} Solicitação(ões) Pendente(s)</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8c93a0', marginTop: '2px' }}>
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
                      borderRadius: '8px',
                      background: notif.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                      {notif.title}
                    </div>
                    <div style={{ color: '#8c93a0', fontSize: '0.74rem' }}>
                      {notif.message}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px 8px', textAlign: 'center', color: '#68707d', fontSize: '0.78rem' }}>
                  Nenhuma notificação pendente no momento.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== USER PROFILE AVATAR WITH WHITE CIRCULAR BORDER ==================== */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={user ? `${user.name} (${user.role})` : 'Perfil'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              background: '#16181b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Silhouette / avatar icon matching reference */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Avatar'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#1a1d22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                {user ? getInitials(user.name) : 'EF'}
              </div>
            )}
          </button>

          {/* User Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '240px',
                background: '#16181b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '12px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {/* User info header */}
              <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  {user?.name || 'Administrador'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#68707d', marginTop: '2px' }}>
                  {user?.email || 'admin@empresa.com'}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>

              {/* Navigation quick links */}
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigateTab) onNavigateTab('users');
                }}
                style={dropdownItemStyle}
              >
                <Users size={14} />
                <span>Equipe e Usuários</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigateTab) onNavigateTab('audit');
                }}
                style={dropdownItemStyle}
              >
                <Settings size={14} />
                <span>Configurações & Auditoria</span>
              </button>

              {/* Sign Out */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.07)', marginTop: '4px', paddingTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  style={{
                    ...dropdownItemStyle,
                    color: '#ef4444'
                  }}
                >
                  <LogOut size={14} />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  background: 'transparent',
  border: 'none',
  color: '#8c93a0',
  fontSize: '0.82rem',
  fontWeight: '500',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.12s ease'
};

