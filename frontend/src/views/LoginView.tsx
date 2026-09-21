import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Globe,
  Search,
  LayoutDashboard,
  Users,
  Building2,
  ChevronDown,
  Layers,
  Loader2,
  FolderKanban,
  FileBarChart,
  HelpCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserInfo) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [locale, setLocale] = useState<'ENG' | 'PT-BR'>('ENG');

  // Inicializa tema e pré-aquece o backend no Render silenciosamente
  useEffect(() => {
    const saved = (localStorage.getItem('crm_theme') as 'dark' | 'light') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    // Warm-up silencioso do backend Render para evitar cold start ao clicar em Sign In
    try {
      fetch('https://leadscope-e8lo.onrender.com/api/health', { method: 'GET', mode: 'cors' }).catch(() => {});
    } catch {
      // noop
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setColdStartNotice(false);

    // Se a requisição demorar mais de 2.5s (cold start típico do Render), exibe aviso
    const coldTimer = setTimeout(() => {
      setColdStartNotice(true);
    }, 2500);

    try {
      if (mode === 'REGISTER') {
        if (password !== confirmPassword) {
          setError('As senhas digitadas não coincidem.');
          setLoading(false);
          clearTimeout(coldTimer);
          return;
        }

        await api.auth.register({
          name,
          email,
          password,
          confirmPassword
        });
        setSuccessMsg('Solicitação enviada com sucesso! Aguarde a aprovação do administrador.');
        setMode('LOGIN');
        setPassword('');
        setConfirmPassword('');
      } else {
        const response = await api.auth.login({ email, password });
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLoginSuccess(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação. Verifique suas credenciais.');
    } finally {
      clearTimeout(coldTimer);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: isDark ? '#08090c' : '#f0efe9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* CARD PRINCIPAL EXPANSIVO PREENCHENDO A TELA (PADRÃO KRAVIO FIEL) */}
      <div style={{
        width: '100%',
        maxWidth: '1540px',
        minHeight: 'calc(100vh - 40px)',
        background: isDark ? '#101217' : '#ffffff',
        borderRadius: '26px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: isDark
          ? '0 30px 70px rgba(0, 0, 0, 0.75)'
          : '0 25px 60px rgba(0, 0, 0, 0.06)',
        display: 'grid',
        gridTemplateColumns: 'minmax(420px, 44%) 1fr',
        overflow: 'hidden'
      }}>

        {/* ==================== PAINEL ESQUERDO: FORMULÁRIO DE LOGIN ==================== */}
        <div style={{
          padding: '40px 52px 32px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isDark ? '#101217' : '#ffffff',
          boxSizing: 'border-box'
        }}>
          {/* Top Bar: Logo + Locale + Tema */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: isDark ? '#ffffff' : '#0f172a',
                  color: isDark ? '#0f172a' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.03em'
                }}>
                  L
                </div>
                <span style={{
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  letterSpacing: '-0.025em',
                  color: isDark ? '#ffffff' : '#0f172a'
                }}>
                  LeadScope
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Locale Dropdown */}
                <div
                  onClick={() => setLocale(locale === 'ENG' ? 'PT-BR' : 'ENG')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    color: isDark ? '#cbd5e1' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <Globe size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <span>{locale}</span>
                  <ChevronDown size={13} />
                </div>

                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title="Alternar Modo Claro / Escuro"
                  style={{
                    background: 'transparent',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    borderRadius: '7px',
                    padding: '5px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    color: isDark ? '#cbd5e1' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  {isDark ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#1e3a5f" />}
                  <span>{isDark ? 'Claro' : 'Escuro'}</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginBottom: '22px' }}>
              <h1 style={{
                fontSize: '1.78rem',
                fontWeight: '700',
                letterSpacing: '-0.03em',
                color: isDark ? '#ffffff' : '#0f172a',
                margin: '0 0 6px 0'
              }}>
                {mode === 'LOGIN' ? 'Sign In to Continue' : 'Solicitar Cadastro'}
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: isDark ? '#8b949e' : '#64748b',
                margin: 0
              }}>
                {mode === 'LOGIN'
                  ? 'Access all your tools in one place.'
                  : 'Seu cadastro passará pela aprovação de um Administrador.'}
              </p>
            </div>

            {/* Aviso Amigável de Inicialização do Servidor (Render Cold Start) */}
            {coldStartNotice && (
              <div style={{
                padding: '11px 14px',
                background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '8px',
                color: isDark ? '#93c5fd' : '#2563eb',
                fontSize: '0.82rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Loader2 size={16} className="spinner" />
                <span>O servidor na nuvem está acordando (Render). Aguarde alguns segundos...</span>
              </div>
            )}

            {/* Success & Error Banners */}
            {successMsg && (
              <div style={{
                padding: '11px 14px',
                background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                color: isDark ? '#6ee7b7' : '#059669',
                fontSize: '0.82rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={17} />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div style={{
                padding: '11px 14px',
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                color: isDark ? '#fca5a5' : '#dc2626',
                fontSize: '0.82rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'REGISTER' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: isDark ? '#c9d1d9' : '#334155',
                    marginBottom: '6px'
                  }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '13px', top: '12px' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Gabriel Castro"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        background: isDark ? '#161920' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                        borderRadius: '9px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: isDark ? '#c9d1d9' : '#334155',
                  marginBottom: '6px'
                }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '13px', top: '12px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="achmadhakim@gmail.com"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      background: isDark ? '#161920' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                      borderRadius: '9px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: isDark ? '#c9d1d9' : '#334155',
                  marginBottom: '6px'
                }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '13px', top: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      background: isDark ? '#161920' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                      borderRadius: '9px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '11px',
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#8b949e' : '#94a3b8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password se Registro */}
              {mode === 'REGISTER' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: isDark ? '#c9d1d9' : '#334155',
                    marginBottom: '6px'
                  }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '13px', top: '12px' }} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        background: isDark ? '#161920' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                        borderRadius: '9px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.86rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Keep me logged in & Forgot password row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                marginTop: '2px',
                marginBottom: '4px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isDark ? '#8b949e' : '#475569',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#0f172a', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span>Keep me logged in</span>
                </label>

                {mode === 'LOGIN' && (
                  <span
                    onClick={() => {
                      setError(null);
                      setSuccessMsg('Para redefinir sua senha, solicite ao Administrador do CRM LeadScope.');
                    }}
                    style={{
                      color: isDark ? '#93c5fa' : '#2563eb',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>

              {/* Botão Primário Sign In */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: isDark ? '#1e293b' : '#0f172a',
                  color: '#ffffff',
                  border: isDark ? '1px solid #334155' : 'none',
                  borderRadius: '9px',
                  fontSize: '0.94rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  transition: 'background 0.15s ease'
                }}
              >
                {loading && <Loader2 size={16} className="spinner" />}
                <span>{loading ? 'Entrando no sistema...' : (mode === 'LOGIN' ? 'Sign In' : 'Solicitar Cadastro')}</span>
              </button>

              {/* Divisor Or */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '6px 0',
                color: isDark ? '#484f58' : '#94a3b8',
                fontSize: '0.8rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
                <span>Or</span>
                <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
              </div>

              {/* Social Login Buttons (Google & Apple - Idênticos ao Kravio) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg('O login unificado corporativo Google Workspace está habilitado para domínios autorizados.');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                    background: isDark ? '#161920' : '#ffffff',
                    color: isDark ? '#e6edf3' : '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Google Icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg('O login seguro com Apple ID corporativo está disponível para contas empresariais.');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                    background: isDark ? '#161920' : '#ffffff',
                    color: isDark ? '#e6edf3' : '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Apple Icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isDark ? '#ffffff' : '#000000'}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.82.94-2.88-.91.04-2.02.6-2.66 1.36-.57.65-.98 1.73-.85 2.76 1.02.08 2.05-.53 2.57-1.24z"/>
                  </svg>
                  <span>Sign in with Apple</span>
                </button>
              </div>
            </form>

            {/* Alternador de Modo: Sign In vs Sign Up */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.84rem', color: isDark ? '#8b949e' : '#64748b' }}>
              {mode === 'LOGIN' ? (
                <>
                  <span>Don't have an account? </span>
                  <span
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      color: isDark ? '#93c5fa' : '#2563eb',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  <span>Já possui acesso aprovado? </span>
                  <span
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    style={{
                      color: isDark ? '#93c5fa' : '#2563eb',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Sign In
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Rodapé Inferior */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.74rem',
            color: isDark ? '#484f58' : '#94a3b8',
            marginTop: '28px',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
            paddingTop: '16px'
          }}>
            <span>© 2026 LeadScope</span>
            <span
              onClick={() => {
                setError(null);
                setSuccessMsg('Central de Suporte: suporte@leadscope.com');
              }}
              style={{ cursor: 'pointer', color: isDark ? '#8b949e' : '#64748b' }}
            >
              Need help? Contact Support
            </span>
          </div>
        </div>

        {/* ==================== PAINEL DIREITO: DASHBOARD MOCKUP & SOCIAL PROOF ==================== */}
        <div style={{
          background: isDark ? '#0a0c10' : '#f7f8fa',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          {/* MOCKUP FLUTUANTE DA DASHBOARD (IDÊNTICO AO KRAVIO) */}
          <div style={{
            background: isDark ? '#141720' : '#ffffff',
            borderRadius: '16px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.6)'
              : '0 20px 40px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Mini Sidebar da Dashboard (Hierarquia Completa do Kravio) */}
            <div style={{
              width: '185px',
              borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: isDark ? '#111319' : '#fafafa'
            }}>
              {/* Logo do Mockup */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    background: isDark ? '#ffffff' : '#0f172a',
                    color: isDark ? '#0f172a' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.72rem'
                  }}>
                    L
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                    LeadScope
                  </span>
                </div>
                <Layers size={13} color="#94a3b8" />
              </div>

              {/* Search Bar no Mockup */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                fontSize: '0.68rem',
                color: isDark ? '#8b949e' : '#94a3b8'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Search size={11} />
                  <span>Search anything</span>
                </div>
                <span style={{ fontSize: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '3px', padding: '1px 3px' }}>⌘K</span>
              </div>

              {/* Section: MAIN NAVIGATION */}
              <div>
                <span style={{ fontSize: '0.6rem', fontWeight: '700', color: isDark ? '#6e7681' : '#94a3b8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  MAIN NAVIGATION
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 8px',
                    borderRadius: '5px',
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.72rem'
                  }}>
                    <LayoutDashboard size={12} color="#2563eb" />
                    <span>Overview</span>
                  </div>

                  {/* Submenu Tickets / Leads */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    color: isDark ? '#cbd5e1' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: '500'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FolderKanban size={12} />
                      <span>Pipeline</span>
                    </div>
                    <ChevronDown size={11} />
                  </div>

                  <div style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.66rem', color: isDark ? '#8b949e' : '#64748b' }}>
                    <span>• All / Active Queue</span>
                    <span>• High Priority</span>
                    <span>• Escalations</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 8px', color: isDark ? '#8b949e' : '#64748b', fontSize: '0.72rem' }}>
                    <Building2 size={12} />
                    <span>Clients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 8px', color: isDark ? '#8b949e' : '#64748b', fontSize: '0.72rem' }}>
                    <Users size={12} />
                    <span>Agents & Teams</span>
                  </div>
                </div>
              </div>

              {/* Section: ANALYTICS & INSIGHTS */}
              <div>
                <span style={{ fontSize: '0.6rem', fontWeight: '700', color: isDark ? '#6e7681' : '#94a3b8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  ANALYTICS & INSIGHTS
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 8px', color: isDark ? '#8b949e' : '#64748b', fontSize: '0.72rem' }}>
                    <ShieldCheck size={12} />
                    <span>SLA Compliance</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 8px', color: isDark ? '#8b949e' : '#64748b', fontSize: '0.72rem' }}>
                    <TrendingUp size={12} />
                    <span>Conversion Rate</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 8px', color: isDark ? '#8b949e' : '#64748b', fontSize: '0.72rem' }}>
                    <FileBarChart size={12} />
                    <span>Reports</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Conteúdo da Dashboard no Mockup */}
            <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Breadcrumb & Greeting */}
              <div>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b', marginBottom: '3px' }}>
                  Overview <span style={{ opacity: 0.5 }}>/</span> Dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                    Hello, Gabriel Castro 👋
                  </h3>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981'
                  }}>
                    PROD ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: isDark ? '#8b949e' : '#64748b', margin: '2px 0 0 0' }}>
                  Here are the latest insights from your customer interactions.
                </p>
              </div>

              {/* 2 Métricas Principais com Sparklines Fluídas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{
                  padding: '10px 12px',
                  background: isDark ? '#111319' : '#f8fafc',
                  borderRadius: '9px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b', fontWeight: '500' }}>
                    Current Leads
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                      3,484
                    </span>
                    {/* Sparkline suave SVG */}
                    <svg width="44" height="18" viewBox="0 0 44 18">
                      <path d="M2,14 C10,14 14,6 22,9 C30,12 34,4 42,2" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: '600', marginTop: '3px' }}>
                    +71% vs last week
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  background: isDark ? '#111319' : '#f8fafc',
                  borderRadius: '9px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b', fontWeight: '500' }}>
                    Daily Avg. Resolution
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                      486
                    </span>
                    {/* Sparkline suave SVG */}
                    <svg width="44" height="18" viewBox="0 0 44 18">
                      <path d="M2,12 C10,12 16,14 24,6 C32,10 36,4 42,3" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: '600', marginTop: '3px' }}>
                    +2% vs last week
                  </div>
                </div>
              </div>

              {/* Volume Trend Gráfico de Barras com Tooltip (Exato ao Kravio) */}
              <div style={{
                padding: '12px 14px',
                background: isDark ? '#111319' : '#f8fafc',
                borderRadius: '9px',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b', fontWeight: '500', display: 'block' }}>
                      Ticket Volume Trend
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                        4,790
                      </span>
                      <span style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: '600' }}>
                        +8% vs last week
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7 Barras com Tooltip flutuante em 'Tue' */}
                <div style={{ position: 'relative', paddingTop: '22px' }}>
                  {/* Tooltip 'Tue : 584' */}
                  <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '38%',
                    transform: 'translateX(-50%)',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.62rem',
                    fontWeight: '700',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>Tue : 584</span>
                  </div>

                  {/* Linha pontilhada horizontal até a borda direita */}
                  <div style={{
                    position: 'absolute',
                    top: '9px',
                    left: '42%',
                    right: '6%',
                    height: '1px',
                    borderTop: '1px dashed #cbd5e1',
                    zIndex: 1
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '58px', gap: '8px' }}>
                    {[
                      { day: 'Sun', height: 38, active: false },
                      { day: 'Mon', height: 56, active: false },
                      { day: 'Tue', height: 92, active: true },
                      { day: 'Wed', height: 48, active: false },
                      { day: 'Thu', height: 72, active: false },
                      { day: 'Fri', height: 60, active: false },
                      { day: 'Sat', height: 36, active: false }
                    ].map(col => (
                      <div key={col.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                          width: '100%',
                          height: `${col.height}%`,
                          borderRadius: '4px',
                          background: col.active
                            ? (isDark ? '#3b82f6' : 'linear-gradient(180deg, #1e293b 0%, #475569 100%)')
                            : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                          transition: 'height 0.3s ease'
                        }} />
                        <span style={{ fontSize: '0.6rem', color: isDark ? '#8b949e' : '#94a3b8', fontWeight: col.active ? '700' : '400' }}>
                          {col.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof & Testimonial Quote (Exato ao Kravio) */}
          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '1.02rem',
              lineHeight: '1.5',
              color: isDark ? '#e6edf3' : '#1e293b',
              margin: '0 0 16px 0',
              fontWeight: '500',
              letterSpacing: '-0.01em'
            }}>
              <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '700' }}>LeadScope has completely changed</strong> how we manage commercial intelligence. It's fast, intuitive, and gives us clear insights that actually matter.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1e3a5f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                GC
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Gabriel Castro
                </div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#8b949e' : '#64748b' }}>
                  Head of Growth & Commercial Intelligence — LumeoTech Inc.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
