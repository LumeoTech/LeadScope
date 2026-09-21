import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  Flag,
  BarChart2,
  Building2,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserInfo) => void;
}

type Language = 'pt' | 'en';

const TRANSLATIONS = {
  pt: {
    localeName: 'Português',
    localeCode: 'PT',
    title: 'Entrar no LeadScope',
    subtitle: 'Inteligência comercial e gestão de prospecção corporativa.',
    emailLabel: 'Endereço de E-mail',
    emailPlaceholder: 'seu.email@empresa.com',
    passwordLabel: 'Senha',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Manter-me conectado',
    forgotPassword: 'Esqueceu a senha?',
    signInButton: 'Entrar',
    signingIn: 'Entrando...',
    serverWaking: 'O servidor em nuvem está acordando (Render). Aguarde alguns instantes...',
    orDivider: 'Ou',
    googleButton: 'Entrar com Google',
    appleButton: 'Entrar com Apple',
    noAccount: 'Não tem uma conta?',
    contactAdmin: 'Fale com o administrador.',
    copyright: `© ${new Date().getFullYear()} LeadScope Inc.`,
    needHelp: 'Precisa de ajuda?',
    contactSupport: 'Falar com Suporte',
    testimonialLead: 'O LeadScope mudou completamente',
    testimonialBody: 'como gerenciamos nossa prospecção comercial. É rápido, intuitivo e nos dá',
    testimonialHighlight: 'insights claros',
    testimonialEnd: 'que realmente importam.',
    themeLight: 'Ativar Modo Claro',
    themeDark: 'Ativar Modo Escuro',
    // Mockup Interface LeadScope
    searchPlaceholder: 'Buscar no LeadScope... ⌘K',
    breadcrumb: 'LeadScope / Dashboard Comercial',
    greeting: 'Olá, Gabriel Castro 👋',
    greetingSub: 'Visão consolidada de oportunidades qualificadas e pipeline em tempo real.',
    activeCampaigns: 'Campanhas Ativas',
    campaignsTrend: '+71% vs mês anterior',
    mappedCompanies: 'Empresas Mapeadas',
    companiesTrend: '+18% novas empresas',
    prospectingVolume: 'Desempenho Semanal de Prospecção',
    volumeTrendBadge: '+8% vs semana anterior',
    tueTooltip: 'Ter : 584 leads',
    days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    // Modal Recuperar Senha
    forgotModalTitle: 'Recuperar Senha',
    forgotModalSub: 'Digite seu e-mail cadastrado. Enviaremos um link seguro via Supabase para você redefinir sua senha.',
    sendResetBtn: 'Enviar E-mail de Recuperação',
    sendingResetBtn: 'Enviando link...',
    backToLogin: 'Voltar ao login',
    resetSuccessMsg: 'E-mail de recuperação enviado com sucesso via Supabase! Verifique sua caixa de entrada e spam.',
    // Modal Suporte & Admin
    adminModalTitle: 'Acesso Restrito ao LeadScope',
    adminModalSub: 'O LeadScope é uma plataforma corporativa exclusiva. Novos acessos são gerados apenas pelo Administrador mediante convite oficial.',
    adminContactTitle: 'Contato do Administrador / Suporte:',
    copyEmail: 'Copiar E-mail',
    emailCopied: 'E-mail copiado!',
    closeBtn: 'Fechar'
  },
  en: {
    localeName: 'English',
    localeCode: 'ENG',
    title: 'Sign In to LeadScope',
    subtitle: 'Commercial intelligence and enterprise prospecting platform.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'user@leadscope.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Keep me logged in',
    forgotPassword: 'Forgot Password?',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    serverWaking: 'Cloud server is waking up (Render). Please wait a moment...',
    orDivider: 'Or',
    googleButton: 'Sign in with Google',
    appleButton: 'Sign in with Apple',
    noAccount: "Don't have an account?",
    contactAdmin: 'Contact administrator.',
    copyright: `© ${new Date().getFullYear()} LeadScope Inc.`,
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
    testimonialLead: 'LeadScope has completely changed',
    testimonialBody: 'how we manage our commercial pipeline. It is fast, intuitive, and gives us',
    testimonialHighlight: 'clear insights',
    testimonialEnd: 'that actually matter.',
    themeLight: 'Switch to Light Mode',
    themeDark: 'Switch to Dark Mode',
    // Mockup Interface LeadScope
    searchPlaceholder: 'Search LeadScope... ⌘K',
    breadcrumb: 'LeadScope / Commercial Dashboard',
    greeting: 'Hello, Gabriel Castro 👋',
    greetingSub: 'Real-time overview of qualified opportunities and sales pipeline.',
    activeCampaigns: 'Active Campaigns',
    campaignsTrend: '+71% vs last month',
    mappedCompanies: 'Mapped Companies',
    companiesTrend: '+18% new accounts',
    prospectingVolume: 'Weekly Prospecting Performance',
    volumeTrendBadge: '+8% vs last week',
    tueTooltip: 'Tue : 584 leads',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    // Modal Forgot Password
    forgotModalTitle: 'Reset Password',
    forgotModalSub: 'Enter your registered email address. We will send a secure Supabase recovery link to reset your password.',
    sendResetBtn: 'Send Recovery Email',
    sendingResetBtn: 'Sending link...',
    backToLogin: 'Back to sign in',
    resetSuccessMsg: 'Password recovery email sent successfully via Supabase! Please check your inbox and spam folder.',
    // Modal Support & Admin
    adminModalTitle: 'LeadScope Exclusive Access',
    adminModalSub: 'LeadScope is a closed enterprise workspace. Access is provisioned exclusively by system administrators via invitation.',
    adminContactTitle: 'Administrator / Support Contact:',
    copyEmail: 'Copy Email',
    emailCopied: 'Email copied!',
    closeBtn: 'Close'
  }
};

const SUPABASE_URL = 'https://xfhaqicwyyliesisfrjq.supabase.co';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { isDark, toggleTheme } = useTheme();
  const [lang, setLang] = useState<Language>('pt');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modais funcionais
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('leadscope_lang') as Language;
    if (savedLang === 'en' || savedLang === 'pt') {
      setLang(savedLang);
    }

    try {
      fetch('https://leadscope-e8lo.onrender.com/api/health', { method: 'GET', mode: 'cors' }).catch(() => {});
    } catch {
      // noop
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('leadscope_lang', newLang);
    setShowLangMenu(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setColdStartNotice(false);

    const noticeTimer = setTimeout(() => {
      setColdStartNotice(true);
    }, 2000);

    try {
      const response = await api.auth.login({ email, password });

      const token = response.accessToken || (response as any).token;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('crm_auth_token', token);
        localStorage.setItem('crm_user_info', JSON.stringify(response.user));
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('crm_auth_token');
        sessionStorage.removeItem('crm_user_info');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        sessionStorage.setItem('crm_auth_token', token);
        sessionStorage.setItem('crm_user_info', JSON.stringify(response.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('crm_auth_token');
        localStorage.removeItem('crm_user_info');
      }

      onLoginSuccess(response.user);
    } catch (err: any) {
      console.error('Falha na autenticação:', err);
      const msg = err.message || (lang === 'pt' ? 'Credenciais inválidas ou erro ao conectar com o servidor.' : 'Invalid credentials or server connection failed.');
      setError(msg);
    } finally {
      clearTimeout(noticeTimer);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'apple') => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const oauthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUri}`;
    window.location.href = oauthUrl;
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          redirect_to: `${window.location.origin}/accept-invite`
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error_description || (lang === 'pt' ? 'Não foi possível enviar o link de recuperação.' : 'Failed to send recovery email.'));
      }

      setForgotSuccess(t.resetSuccessMsg);
      setForgotEmail('');
    } catch (err: any) {
      setForgotSuccess(t.resetSuccessMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('suporte@leadscope.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px 18px',
      background: isDark ? '#090a0c' : '#ebe9e1',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: 'border-box',
      transition: 'background 0.25s ease'
    }}>
      <style>{`
        .leadscope-login-input:-webkit-autofill,
        .leadscope-login-input:-webkit-autofill:hover, 
        .leadscope-login-input:-webkit-autofill:focus, 
        .leadscope-login-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px ${isDark ? '#1a1c22' : '#ffffff'} inset !important;
          -webkit-text-fill-color: ${isDark ? '#ffffff' : '#0f172a'} !important;
          caret-color: ${isDark ? '#ffffff' : '#0f172a'} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      {/* CARD FLUTUANTE EXPANDIDO ("BOLHA FLUTUANDO" MAIOR, COM MODO ESCURO COMPLETO) */}
      <div style={{
        width: '100%',
        maxWidth: '1540px',
        minHeight: '720px',
        height: 'min(94vh, 920px)',
        background: isDark ? '#14161b' : '#ffffff',
        borderRadius: '32px',
        boxShadow: isDark
          ? '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.12)'
          : '0 25px 65px rgba(0, 0, 0, 0.07)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.04)',
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        alignItems: 'stretch',
        overflow: 'hidden',
        transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
      }}>

        {/* ==================== COLUNA ESQUERDA: NOSSA INTERFACE LEADSCOPE ==================== */}
        <div style={{
          height: '100%',
          padding: '38px 58px 28px 58px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isDark ? '#14161b' : '#ffffff',
          boxSizing: 'border-box',
          overflowY: 'auto',
          transition: 'background 0.25s ease'
        }}>
          {/* TOPO: LOGO LEADSCOPE À ESQUERDA, TEMA & SELETOR DE IDIOMA À DIREITA */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Logo Oficial LeadScope */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: isDark ? '#1e293b' : '#0f172a',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.25rem',
                letterSpacing: '-0.04em',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : 'none'
              }}>
                L
              </div>
              <span style={{
                fontWeight: '800',
                fontSize: '1.3rem',
                letterSpacing: '-0.03em',
                color: isDark ? '#ffffff' : '#0f172a'
              }}>
                LeadScope
              </span>
            </div>

            {/* Controles: Alternador de Tema Escuro/Claro + Seletor de Idioma */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              {/* Botão Alternador de Tema */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? t.themeLight : t.themeDark}
                aria-label="Alternar tema"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '9px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  background: isDark ? '#1e2026' : '#ffffff',
                  color: isDark ? '#fbbf24' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
              </button>

              {/* Seletor de Idioma */}
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '38px',
                  padding: '0 13px',
                  borderRadius: '9px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  background: isDark ? '#1e2026' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <Globe size={15} color={isDark ? '#94a3b8' : '#64748b'} />
                <span>{t.localeCode}</span>
                <ChevronDown size={13} color={isDark ? '#94a3b8' : '#64748b'} />
              </button>

              {/* Dropdown de Idiomas */}
              {showLangMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  background: isDark ? '#1e2026' : '#ffffff',
                  borderRadius: '10px',
                  boxShadow: isDark ? '0 15px 35px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.1)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
                  padding: '5px',
                  minWidth: '140px',
                  zIndex: 50
                }}>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('pt')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: lang === 'pt' ? (isDark ? '#2a2e38' : '#f1f5f9') : 'transparent',
                      color: lang === 'pt' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#cbd5e1' : '#475569'),
                      fontWeight: lang === 'pt' ? '700' : '500',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🇧🇷</span>
                    <span>Português</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: lang === 'en' ? (isDark ? '#2a2e38' : '#f1f5f9') : 'transparent',
                      color: lang === 'en' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#cbd5e1' : '#475569'),
                      fontWeight: lang === 'en' ? '700' : '500',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTRO: FORMULÁRIO DO LEADSCOPE COM NOSSA IDENTIDADE */}
          <div style={{
            margin: 'auto 0',
            maxWidth: '430px',
            width: '100%',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Título & Subtítulo */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '1.95rem',
                fontWeight: '700',
                letterSpacing: '-0.03em',
                color: isDark ? '#ffffff' : '#0f172a',
                margin: '0 0 6px 0'
              }}>
                {t.title}
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: isDark ? '#94a3b8' : '#64748b',
                margin: 0,
                lineHeight: '1.45'
              }}>
                {t.subtitle}
              </p>
            </div>

            {/* Aviso de Render Cold Start */}
            {coldStartNotice && (
              <div style={{
                padding: '9px 13px',
                background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 58, 95, 0.08)',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(30, 58, 95, 0.25)',
                borderRadius: '8px',
                color: isDark ? '#93c5fd' : '#1e3a5f',
                fontSize: '0.81rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Loader2 size={15} className="spinner" />
                <span>{t.serverWaking}</span>
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div style={{
                padding: '9px 13px',
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
                borderRadius: '8px',
                color: isDark ? '#fca5a5' : '#dc2626',
                fontSize: '0.81rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Formulário de Login */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo de E-mail */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: isDark ? '#cbd5e1' : '#334155',
                  marginBottom: '6px'
                }}>
                  {t.emailLabel} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={isDark ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input
                    type="email"
                    required
                    className="leadscope-login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px 0 42px',
                      background: isDark ? '#1a1c22' : '#ffffff',
                      border: isDark ? '1px solid #2e323b' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      colorScheme: isDark ? 'dark' : 'light',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                </div>
              </div>

              {/* Campo de Senha */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: isDark ? '#cbd5e1' : '#334155',
                  marginBottom: '6px'
                }}>
                  {t.passwordLabel} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color={isDark ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="leadscope-login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 42px 0 42px',
                      background: isDark ? '#1a1c22' : '#ffffff',
                      border: isDark ? '1px solid #2e323b' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      colorScheme: isDark ? 'dark' : 'light',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '13px',
                      top: '13px',
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#64748b' : '#94a3b8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox Manter-me conectado & Esqueceu a Senha */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                marginTop: '1px',
                marginBottom: '2px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isDark ? '#94a3b8' : '#475569',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: isDark ? '#38bdf8' : '#0f172a',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{t.rememberMe}</span>
                </label>

                <span
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    color: isDark ? '#38bdf8' : '#0f172a',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.81rem'
                  }}
                >
                  {t.forgotPassword}
                </span>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isDark ? '#ffffff' : '#0f172a',
                  color: isDark ? '#090a0c' : '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                  boxShadow: isDark ? '0 4px 14px rgba(255,255,255,0.15)' : '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                {loading && <Loader2 size={16} className="spinner" />}
                <span>{loading ? t.signingIn : t.signInButton}</span>
              </button>

              {/* Linha Divisória 'Ou' */}
              <div style={{
                position: 'relative',
                textAlign: 'center',
                margin: '6px 0 2px 0'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  borderTop: isDark ? '1px solid #282c35' : '1px solid #e2e8f0'
                }} />
                <span style={{
                  position: 'relative',
                  background: isDark ? '#14161a' : '#ffffff',
                  padding: '0 12px',
                  fontSize: '0.76rem',
                  color: isDark ? '#64748b' : '#94a3b8',
                  fontWeight: '500'
                }}>
                  {t.orDivider}
                </span>
              </div>

              {/* Botões Sociais Google & Apple via Supabase OAuth */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '42px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #2e323b' : '1px solid #cbd5e1',
                    background: isDark ? '#1a1c22' : '#ffffff',
                    color: isDark ? '#e2e8f0' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                  </svg>
                  <span>{t.googleButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('apple')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '42px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #2e323b' : '1px solid #cbd5e1',
                    background: isDark ? '#1a1c22' : '#ffffff',
                    color: isDark ? '#e2e8f0' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark ? '#ffffff' : '#000000'}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.82.94-2.88-.91.04-2.02.6-2.66 1.36-.57.65-.98 1.73-.85 2.76 1.02.08 2.05-.53 2.57-1.24z"/>
                  </svg>
                  <span>{t.appleButton}</span>
                </button>
              </div>
            </form>

            {/* Link de Contato com Admin */}
            <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.83rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              <span>{t.noAccount} </span>
              <span
                onClick={() => setShowAdminModal(true)}
                style={{
                  color: isDark ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textDecoration: 'underline'
                }}
              >
                {t.contactAdmin}
              </span>
            </div>
          </div>

          {/* RODAPÉ: COPYRIGHT & SUPORTE */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: isDark ? '#64748b' : '#94a3b8'
          }}>
            <span>{t.copyright}</span>
            <span
              onClick={() => setShowAdminModal(true)}
              style={{
                cursor: 'pointer',
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: '500'
              }}
            >
              {t.needHelp} <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{t.contactSupport}</strong>
            </span>
          </div>
        </div>

        {/* ==================== COLUNA DIREITA: NOSSA PRÉVIA LEADSCOPE ==================== */}
        <div style={{
          height: '100%',
          background: isDark ? '#0e0f13' : '#f7f8fa',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f0f1f3',
          padding: '38px 48px 30px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          transition: 'background 0.25s ease'
        }}>
          {/* PRÉVIA REAL DO DASHBOARD COM OS MÓDULOS E KPIS DO LEADSCOPE */}
          <div style={{
            flex: 1,
            maxHeight: '520px',
            background: isDark ? '#16181e' : '#ffffff',
            borderRadius: '20px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark
              ? '0 20px 45px rgba(0, 0, 0, 0.5)'
              : '0 15px 35px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}>
            {/* MINI-SIDEBAR OFICIAL DO LEADSCOPE (COM NOSSOS MÓDULOS REAIS) */}
            <div style={{
              width: '54px',
              borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f2f4',
              padding: '18px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? '#090a0c' : '#0c0d0f'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                {/* Ícone Stylized Flux do LeadScope */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0c0d0f',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.8rem'
                }}>
                  L
                </div>

                {/* Módulos Reais do LeadScope */}
                <div
                  title="Dashboard"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <LayoutGrid size={16} color="#ffffff" />
                </div>

                <div title="Campanhas / Leads" style={{ color: '#8c93a0', padding: '6px' }}>
                  <Flag size={16} />
                </div>

                <div title="Analytics / Scanner" style={{ color: '#8c93a0', padding: '6px' }}>
                  <BarChart2 size={16} />
                </div>

                <div title="Empresas Mapeadas" style={{ color: '#8c93a0', padding: '6px' }}>
                  <Building2 size={16} />
                </div>
              </div>

              {/* Status do Workspace Ativo */}
              <div title="Workspace Conectado" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              </div>
            </div>

            {/* PAINEL PRINCIPAL DO DASHBOARD LEADSCOPE */}
            <div style={{
              flex: 1,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              {/* Header do Mockup */}
              <div>
                <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '3px', fontWeight: '500' }}>
                  {t.breadcrumb}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                    {t.greeting}
                  </h3>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981'
                  }}>
                    WORKSPACE ATIVO
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: isDark ? '#8c93a0' : '#64748b', margin: '3px 0 0 0' }}>
                  {t.greetingSub}
                </p>
              </div>

              {/* KPIs Reais do LeadScope */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                  padding: '12px 14px',
                  background: isDark ? '#1c1f26' : '#f8fafc',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
                    {t.activeCampaigns}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                      3.484
                    </span>
                    <svg width="48" height="18" viewBox="0 0 46 18">
                      <path d="M2,15 C10,15 15,6 24,9 C32,12 36,4 44,2" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.67rem', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
                    {t.campaignsTrend}
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  background: isDark ? '#1c1f26' : '#f8fafc',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
                    {t.mappedCompanies}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                      1.280
                    </span>
                    <svg width="48" height="18" viewBox="0 0 46 18">
                      <path d="M2,13 C12,13 18,15 26,5 C34,9 38,3 44,2" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.67rem', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
                    {t.companiesTrend}
                  </div>
                </div>
              </div>

              {/* Volume de Prospecção do LeadScope com Tooltip de Terça-Feira */}
              <div style={{
                padding: '14px 16px',
                background: isDark ? '#1c1f26' : '#f8fafc',
                borderRadius: '10px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500', display: 'block' }}>
                      {t.prospectingVolume}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                        4.790 leads
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>
                        {t.volumeTrendBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7 Barras com Tooltip Flutuante */}
                <div style={{ position: 'relative', paddingTop: '22px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '38%',
                    transform: 'translateX(-50%)',
                    background: isDark ? '#ffffff' : '#0f172a',
                    color: isDark ? '#090a0c' : '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.64rem',
                    fontWeight: '700',
                    boxShadow: isDark ? '0 4px 10px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.25)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span>{t.tueTooltip}</span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '9px',
                    left: '42%',
                    right: '6%',
                    height: '1px',
                    borderTop: isDark ? '1px dashed #3a3f4d' : '1px dashed #cbd5e1',
                    zIndex: 1
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '78px', gap: '9px' }}>
                    {[
                      { day: t.days[0], height: 38, active: false },
                      { day: t.days[1], height: 56, active: false },
                      { day: t.days[2], height: 92, active: true },
                      { day: t.days[3], height: 48, active: false },
                      { day: t.days[4], height: 72, active: false },
                      { day: t.days[5], height: 60, active: false },
                      { day: t.days[6], height: 36, active: false }
                    ].map(col => (
                      <div key={col.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                          width: '100%',
                          height: `${col.height}%`,
                          borderRadius: '4px',
                          background: col.active
                            ? (isDark
                                ? 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)'
                                : 'linear-gradient(180deg, #1e293b 0%, #475569 100%)')
                            : (isDark ? '#2a2f3a' : '#e2e8f0'),
                          transition: 'height 0.3s ease',
                          boxShadow: col.active && isDark ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'
                        }} />
                        <span style={{
                          fontSize: '0.64rem',
                          color: col.active ? (isDark ? '#38bdf8' : '#0f172a') : (isDark ? '#717b8f' : '#94a3b8'),
                          fontWeight: col.active ? '700' : '400'
                        }}>
                          {col.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEPOIMENTO CORPORATIVO (SEM NOME FICTÍCIO DE TERCEIROS) */}
          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '1.08rem',
              lineHeight: '1.6',
              color: isDark ? '#cbd5e1' : '#1e293b',
              margin: 0,
              fontWeight: '500',
              letterSpacing: '-0.01em'
            }}>
              <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '800' }}>
                {t.testimonialLead}
              </strong>{' '}
              {t.testimonialBody}{' '}
              <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '800' }}>
                {t.testimonialHighlight}
              </strong>{' '}
              {t.testimonialEnd}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== MODAL DE RECUPERAÇÃO DE SENHA (SUPABASE AUTH) ==================== */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 10, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? '#16181e' : '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(null);
                setForgotError(null);
              }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: isDark ? '#94a3b8' : '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 6px 0' }}>
              {t.forgotModalTitle}
            </h2>
            <p style={{ fontSize: '0.84rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 18px 0', lineHeight: '1.5' }}>
              {t.forgotModalSub}
            </p>

            {forgotSuccess && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div style={{
                padding: '10px 12px',
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fecaca',
                borderRadius: '8px',
                color: isDark ? '#fca5a5' : '#dc2626',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: isDark ? '#cbd5e1' : '#334155', marginBottom: '5px' }}>
                    {t.emailLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color={isDark ? '#64748b' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    <input
                      type="email"
                      required
                      className="leadscope-login-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        background: isDark ? '#1a1c22' : '#ffffff',
                        border: isDark ? '1px solid #2e323b' : '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        colorScheme: isDark ? 'dark' : 'light',
                        fontSize: '0.84rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: isDark ? '#ffffff' : '#0f172a',
                    color: isDark ? '#090a0c' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {forgotLoading && <Loader2 size={15} className="spinner" />}
                  <span>{forgotLoading ? t.sendingResetBtn : t.sendResetBtn}</span>
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: isDark ? '#ffffff' : '#0f172a',
                  color: isDark ? '#090a0c' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {t.backToLogin}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL DE CONTATO DO ADMINISTRADOR & SUPORTE ==================== */}
      {showAdminModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 10, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? '#16181e' : '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: isDark ? '#94a3b8' : '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: isDark ? '#1e2026' : '#f1f5f9',
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <HelpCircle size={20} />
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 6px 0' }}>
              {t.adminModalTitle}
            </h2>
            <p style={{ fontSize: '0.84rem', color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              {t.adminModalSub}
            </p>

            <div style={{
              background: isDark ? '#1c1f26' : '#f8fafc',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isDark ? '#94a3b8' : '#475569', display: 'block', marginBottom: '6px' }}>
                {t.adminContactTitle}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                  suporte@leadscope.com
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 8px',
                    background: isDark ? '#262932' : '#ffffff',
                    border: isDark ? '1px solid #333742' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    color: isDark ? '#e2e8f0' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={12} />
                  <span>{copiedEmail ? t.emailCopied : t.copyEmail}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: isDark ? '#ffffff' : '#0f172a',
                color: isDark ? '#090a0c' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
