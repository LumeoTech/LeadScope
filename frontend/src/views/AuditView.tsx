import React, { useEffect, useState, useRef } from 'react';
import { api, AuditLog, UserSettingsDto } from '../services/api';
import {
  Settings,
  ShieldCheck,
  User,
  Bell,
  Palette,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Globe,
  Camera,
  Upload,
  Trash2,
  Key,
  Shield,
  Clock
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');

  // ——— Settings States ———
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Perfil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: 'A imagem selecionada é muito grande. Escolha uma imagem de até 8MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setFeedbackMsg({ type: 'success', text: 'Foto carregada! Clique em "Salvar Alterações" para aplicar no seu perfil.' });
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Aparência
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>('pt-BR');

  // Notificações
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyNewAppointment, setNotifyNewAppointment] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);

  // Segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // ——— Audit Logs States ———
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await api.settings.getMySettings();
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        setRole(data.role || 'ADMIN');
        setAvatarUrl(data.avatarUrl || '');
        setTheme((data.theme as 'dark' | 'light') || 'dark');
        setLanguage((data.language as 'pt-BR' | 'en-US') || 'pt-BR');
        setNotifyNewLead(data.notifyNewLead !== false);
        setNotifyNewAppointment(data.notifyNewAppointment !== false);
        setNotifyDailySummary(data.notifyDailySummary !== false);

        // Atualizar tema no DOM
        if (data.theme) {
          document.documentElement.setAttribute('data-theme', data.theme);
        }
      }
    } catch (err: any) {
      console.warn('Erro ao carregar configurações do usuário:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setFeedbackMsg(null);
    try {
      const payload: Partial<UserSettingsDto> = {
        name: name.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim(),
        theme,
        language,
        notifyNewLead,
        notifyNewAppointment,
        notifyDailySummary
      };

      await api.settings.saveMySettings(payload);

      // Aplicar tema no DOM imediatamente
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('leadscope_theme', theme);
      localStorage.setItem('leadscope_lang', language);

      // Atualizar dados no localStorage do usuário se aplicável
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          parsed.name = name.trim();
          parsed.email = email.trim();
          parsed.avatarUrl = avatarUrl.trim();
          localStorage.setItem('user', JSON.stringify(parsed));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {}

      setFeedbackMsg({
        type: 'success',
        text: 'Configurações salvas no Supabase com sucesso!'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: 'Erro ao salvar configurações: ' + (err.message || 'Falha de conexão')
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setFeedbackMsg({ type: 'error', text: 'Preencha a senha atual e a nova senha.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedbackMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedbackMsg({ type: 'error', text: 'A confirmação de senha não confere.' });
      return;
    }

    setChangingPassword(true);
    setFeedbackMsg(null);
    try {
      const res = await api.settings.changePassword({
        currentPassword,
        newPassword
      });
      setFeedbackMsg({
        type: 'success',
        text: res.message || 'Senha alterada com sucesso!'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: 'Erro ao alterar senha: ' + (err.message || 'Senha atual incorreta.')
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!window.confirm('Deseja realmente revogar todas as outras sessões ativas? Você precisará fazer login novamente em outros dispositivos.')) {
      return;
    }

    setRevokingSessions(true);
    setFeedbackMsg(null);
    try {
      const res = await api.settings.revokeSessions();
      setFeedbackMsg({
        type: 'success',
        text: res.message || 'Todas as outras sessões foram revogadas com sucesso.'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: 'Erro ao revogar sessões: ' + (err.message || 'Falha de requisição')
      });
    } finally {
      setRevokingSessions(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.audit.list();
      setLogs(res.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadLogs();
    }
  }, [activeTab]);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '6px 0 40px' }}>
      {/* Header com Tabs e Botão Salvar Geral */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Configurações & Governança
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Gerencie seu perfil, preferências visuais, notificações de automação e segurança
          </p>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'settings' ? '#1e3a5f' : 'transparent',
                color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Settings size={15} />
              <span>Configurações</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'audit' ? '#1e3a5f' : 'transparent',
                color: activeTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={15} />
              <span>Auditoria do Sistema</span>
            </button>
          </div>

          {activeTab === 'settings' && (
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings || loadingSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px solid #2e558a',
                background: '#1e3a5f',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: savingSettings || loadingSettings ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 10px rgba(30, 58, 95, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              {savingSettings ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              <span>{savingSettings ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedbackMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${feedbackMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedbackMsg.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.86rem',
          fontWeight: '600'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ===================== TAB 1: CONFIGURAÇÕES COMPLETAS ===================== */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 1. SEÇÃO PERFIL */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(30, 58, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Perfil do Usuário
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Identificação pessoal e imagem de exibição no workspace
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
              {/* Foto / Avatar Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Clique para escolher uma foto do seu computador ou celular"
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #1e3a5f',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                        transition: 'transform 0.15s ease'
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(30, 58, 95, 0.6)',
                      border: '3px solid #1e3a5f',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: '800',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
                    }}>
                      {(name || 'G').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#2563eb',
                    borderRadius: '50%',
                    padding: '6px',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    <Camera size={13} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload de Foto</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl('');
                          setFeedbackMsg({ type: 'success', text: 'Foto removida. Salve as alterações para confirmar.' });
                        }}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#f87171'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={avatarUrl.startsWith('data:') ? '(Foto carregada via arquivo local)' : avatarUrl}
                    onChange={(e) => {
                      if (!e.target.value.startsWith('(Foto')) {
                        setAvatarUrl(e.target.value);
                      }
                    }}
                    placeholder="Ou cole a URL direta de uma imagem"
                    className="input"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Suporta imagens JPG, PNG e WebP com compressão automática.
                  </span>
                </div>
              </div>

              {/* Campos Nome & E-mail */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      E-mail Institucional
                    </label>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#93c5fd',
                      background: 'rgba(30, 58, 95, 0.4)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {role}
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEÇÃO APARÊNCIA */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(30, 58, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
                <Palette size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Aparência & Idioma
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Escolha o tema de contraste e a linguagem da plataforma
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Tema Claro / Escuro */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Tema da Interface
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: theme === 'dark' ? '#1e3a5f' : 'var(--bg-hover)',
                      border: theme === 'dark' ? '1.5px solid #2e558a' : '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: theme === 'dark' ? '0 4px 12px rgba(30, 58, 95, 0.4)' : 'none'
                    }}
                  >
                    <Moon size={16} color={theme === 'dark' ? '#93c5fd' : '#8c93a0'} />
                    <span>Tema Escuro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      document.documentElement.setAttribute('data-theme', 'light');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: theme === 'light' ? '#1e3a5f' : 'var(--bg-hover)',
                      border: theme === 'light' ? '1.5px solid #2e558a' : '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: theme === 'light' ? '0 4px 12px rgba(30, 58, 95, 0.4)' : 'none'
                    }}
                  >
                    <Sun size={16} color={theme === 'light' ? '#f59e0b' : '#8c93a0'} />
                    <span>Tema Claro</span>
                  </button>
                </div>
              </div>

              {/* Idioma */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Idioma da Interface
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setLanguage('pt-BR')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: language === 'pt-BR' ? '#1e3a5f' : 'var(--bg-hover)',
                      border: language === 'pt-BR' ? '1.5px solid #2e558a' : '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Globe size={16} color={language === 'pt-BR' ? '#93c5fd' : '#8c93a0'} />
                    <span>Português (BR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('en-US')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: language === 'en-US' ? '#1e3a5f' : 'var(--bg-hover)',
                      border: language === 'en-US' ? '1.5px solid #2e558a' : '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Globe size={16} color={language === 'en-US' ? '#93c5fd' : '#8c93a0'} />
                    <span>English (US)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SEÇÃO NOTIFICAÇÕES */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(30, 58, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Notificações & Alertas
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Selecione os gatilhos em tempo real para recebimento de alertas
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Toggle 1: Novo Lead */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-hover)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                    Novo lead capturado & qualificado
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Receba um alerta instantâneo assim que o scanner autônomo qualificar um novo lead no funil
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewLead}
                  onChange={(e) => setNotifyNewLead(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1e3a5f' }}
                />
              </div>

              {/* Toggle 2: Novo Compromisso */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-hover)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                    Novo compromisso ou reunião agendada
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Notificações de reuniões, follow-ups e visitas comerciais registradas na agenda
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewAppointment}
                  onChange={(e) => setNotifyNewAppointment(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1e3a5f' }}
                />
              </div>

              {/* Toggle 3: Resumo Diário */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-hover)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                    Resumo diário matinal de performance
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Consolidado de oportunidades quentes, métricas de aceite e metas do dia
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDailySummary}
                  onChange={(e) => setNotifyDailySummary(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1e3a5f' }}
                />
              </div>
            </div>
          </div>

          {/* 4. SEÇÃO SEGURANÇA */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(30, 58, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd' }}>
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Segurança & Acessos
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Modificação de credenciais de acesso e encerramento de sessões ativas
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Formulário de Troca de Senha */}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} color="#93c5fd" />
                  <span>Trocar Senha de Acesso</span>
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ width: '100%' }}
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ width: '100%' }}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    style={{ width: '100%' }}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #2e558a',
                    background: '#1e3a5f',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: changingPassword ? 'not-allowed' : 'pointer',
                    marginTop: '4px'
                  }}
                >
                  {changingPassword ? <Loader2 size={15} className="spin" /> : <Lock size={15} />}
                  <span>{changingPassword ? 'Atualizando senha...' : 'Atualizar Minha Senha'}</span>
                </button>
              </form>

              {/* Revogação de Sessões */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '10px'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} />
                    <span>Revogação Global de Sessões</span>
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                    Caso suspeite que suas credenciais foram comprometidas ou deseja desconectar de outros computadores e celulares, revogue todas as sessões ativas com um clique.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRevokeSessions}
                  disabled={revokingSessions}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: revokingSessions ? 'not-allowed' : 'pointer',
                    marginTop: '16px'
                  }}
                >
                  {revokingSessions ? <Loader2 size={15} className="spin" /> : <LogOut size={15} />}
                  <span>{revokingSessions ? 'Revogando...' : 'Revogar Todas as Sessões Ativas'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Botão Salvar Rodapé */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings || loadingSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #2e558a',
                background: '#1e3a5f',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: savingSettings || loadingSettings ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(30, 58, 95, 0.4)'
              }}
            >
              {savingSettings ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              <span>{savingSettings ? 'Salvando Configurações...' : 'Salvar Todas as Configurações no Banco'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: AUDITORIA DO SISTEMA ===================== */}
      {activeTab === 'audit' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Rastreabilidade de Ações
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Registro imutável de criação, alterações de status e permissões
              </p>
            </div>
            <button onClick={loadLogs} disabled={loadingLogs} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{loadingLogs ? 'Atualizando...' : 'Atualizar Logs'}</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px' }}>AÇÃO</th>
                  <th style={{ padding: '14px 18px' }}>ENTIDADE</th>
                  <th style={{ padding: '14px 18px' }}>DESCRIÇÃO</th>
                  <th style={{ padding: '14px 18px' }}>ORIGEM / IP</th>
                  <th style={{ padding: '14px 18px' }}>DATA / HORA</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loadingLogs ? 'Carregando trilha de auditoria...' : 'Nenhum log de auditoria registrado até o momento.'}
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${
                          log.action === 'CREATE' ? 'badge-success' :
                          log.action === 'STATUS_CHANGE' || log.action === 'ASSIGN' ? 'badge-primary' :
                          log.action === 'UPDATE' ? 'badge-info' : 'badge-danger'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                        {log.entityType} #{log.entityId}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-primary)' }}>
                        {log.description}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;
