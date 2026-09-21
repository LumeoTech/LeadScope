import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
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
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  HelpCircle
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserInfo) => void;
}

type Language = 'pt' | 'en';

const TRANSLATIONS = {
  pt: {
    localeName: 'Português',
    localeCode: 'PT',
    title: 'Entrar para Continuar',
    subtitle: 'Acesse todas as suas ferramentas em um só lugar.',
    emailLabel: 'Endereço de E-mail',
    emailPlaceholder: 'achmadhakim@gmail.com',
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
    copyright: `© ${new Date().getFullYear()} LeadScope`,
    needHelp: 'Precisa de ajuda?',
    contactSupport: 'Falar com Suporte',
    testimonialText: 'O LeadScope mudou completamente como gerenciamos nossa prospecção. É rápido, intuitivo e nos dá insights claros que realmente importam.',
    testimonialAuthor: 'Sarah Kim',
    testimonialRole: 'Gerente de Experiência e Vendas — TechWave Inc.',
    // Mockup
    searchPlaceholder: 'Buscar no LeadScope...',
    mainNav: 'NAVEGAÇÃO PRINCIPAL',
    overview: 'Visão Geral',
    pipeline: 'Pipeline de Leads',
    allQueue: '• Fila Ativa',
    highPriority: '• Alta Prioridade',
    escalations: '• Escalações',
    clients: 'Clientes',
    agentsTeams: 'Equipe Comercial',
    knowledgeBase: 'Base de Conhecimento',
    integrations: 'Integrações',
    analyticsInsights: 'ANÁLISES & INSIGHTS',
    slaCompliance: 'Métricas de SLA',
    csatNps: 'Assertividade & CSAT',
    workload: 'Volume de Atendimento',
    reports: 'Relatórios',
    breadcrumb: 'Visão Geral / Dashboard',
    greeting: 'Olá, Gabriel Castro 👋',
    greetingSub: 'Aqui estão os insights mais recentes das suas interações comerciais.',
    currentLeads: 'Leads Ativos',
    leadsTrend: '+71% vs semana anterior',
    dailyAvgClose: 'Tempo Médio Resolução',
    closeTrend: '+2% vs semana anterior',
    ticketTrend: 'Volume de Prospecção',
    ticketTrendBadge: '+8% vs semana anterior',
    tueTooltip: 'Ter : 584',
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
    localeCode: 'EN',
    title: 'Sign In to Continue',
    subtitle: 'Access all your tools in one place.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'achmadhakim@gmail.com',
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
    copyright: `© ${new Date().getFullYear()} LeadScope`,
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
    testimonialText: "LeadScope has completely changed how we manage customer support. It's fast, intuitive, and gives us clear insights that actually matter.",
    testimonialAuthor: 'Sarah Kim',
    testimonialRole: 'Customer Experience Manager — TechWave Inc.',
    // Mockup
    searchPlaceholder: 'Search anything',
    mainNav: 'MAIN NAVIGATION',
    overview: 'Overview',
    pipeline: 'Tickets',
    allQueue: '• All / My Queue',
    highPriority: '• SLA Breach Risk',
    escalations: '• Escalations',
    clients: 'Clients',
    agentsTeams: 'Agents & Teams',
    knowledgeBase: 'Knowledge Base',
    integrations: 'Integrations',
    analyticsInsights: 'ANALYTICS & INSIGHTS',
    slaCompliance: 'SLA Compliance',
    csatNps: 'CSAT & NPS',
    workload: 'Workload Analytics',
    reports: 'Reports',
    breadcrumb: 'Overview / Dashboard',
    greeting: 'Hello, Achmad Hakim 👋',
    greetingSub: 'Here are the latest insights from your customer interactions.',
    currentLeads: 'Current Tickets',
    leadsTrend: '+71% vs last week',
    dailyAvgClose: 'Daily Avg. Resolution',
    closeTrend: '+2% vs last week',
    ticketTrend: 'Ticket Volume Trend',
    ticketTrendBadge: '+8% vs last week',
    tueTooltip: 'Tue : 584',
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
    // Carrega preferência de idioma persistida
    const savedLang = localStorage.getItem('leadscope_lang') as Language;
    if (savedLang === 'en' || savedLang === 'pt') {
      setLang(savedLang);
    }

    // Warm-up silencioso da API para garantir resposta instantânea
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

    // Se a requisição demorar mais de 2 segundos (Render acordando), avisa o usuário
    const noticeTimer = setTimeout(() => {
      setColdStartNotice(true);
    }, 2000);

    try {
      const response = await api.auth.login({ email, password });

      // Persistência da sessão conforme a preferência "Manter-me conectado"
      if (rememberMe) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('token', response.accessToken);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      onLoginSuccess(response.user);
    } catch (err: any) {
      const msg = err.message || (lang === 'pt' ? 'Credenciais inválidas. Verifique seu e-mail e senha.' : 'Invalid credentials. Please check your email and password.');
      setError(msg);
    } finally {
      clearTimeout(noticeTimer);
      setLoading(false);
      setColdStartNotice(false);
    }
  };

  // OAuth com Supabase para Google e Apple
  const handleOAuthLogin = (provider: 'google' | 'apple') => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const oauthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUri}`;
    window.location.href = oauthUrl;
  };

  // Envio real de recuperação de senha via Supabase
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
      padding: '16px', // Margem fina ao redor do card
      background: '#ebe9e1', // Cinza claro suave idêntico à referência Kravio
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* CARD PRINCIPAL EXPANSIVO (ALTURA MÍNIMA 90VH E LARGURA MÍNIMA 85VW) */}
      <div style={{
        width: 'calc(100vw - 32px)',
        minWidth: '85vw',
        maxWidth: '1680px',
        height: 'calc(100vh - 32px)',
        minHeight: '90vh',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // 50% / 50% exatos
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>

        {/* ==================== COLUNA ESQUERDA: FORMULÁRIO (50%) ==================== */}
        <div style={{
          height: '100%',
          padding: '40px 60px 32px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {/* TOPO: LOGO LEADSCOPE À ESQUERDA E SELETOR DE IDIOMA À DIREITA */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            position: 'relative'
          }}>
            {/* Logo do LeadScope */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.25rem',
                letterSpacing: '-0.04em'
              }}>
                L
              </div>
              <span style={{
                fontWeight: '700',
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                color: '#0f172a'
              }}>
                LeadScope
              </span>
            </div>

            {/* Seletor de Idioma */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Globe size={15} color="#64748b" />
                <span>{t.localeCode}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {/* Dropdown de Idiomas */}
              {showLangMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  minWidth: '150px',
                  zIndex: 50
                }}>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('pt')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: lang === 'pt' ? '#f1f5f9' : 'transparent',
                      color: lang === 'pt' ? '#0f172a' : '#475569',
                      fontWeight: lang === 'pt' ? '700' : '500',
                      fontSize: '0.84rem',
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
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: lang === 'en' ? '#f1f5f9' : 'transparent',
                      color: lang === 'en' ? '#0f172a' : '#475569',
                      fontWeight: lang === 'en' ? '700' : '500',
                      fontSize: '0.84rem',
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

          {/* CENTRO: FORMULÁRIO COM RESPIRO VERTICAL GENEROSO */}
          <div style={{
            margin: 'auto 0',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Título & Subtítulo */}
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{
                fontSize: '2.05rem',
                fontWeight: '700',
                letterSpacing: '-0.035em',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                {t.title}
              </h1>
              <p style={{
                fontSize: '0.96rem',
                color: '#64748b',
                margin: 0
              }}>
                {t.subtitle}
              </p>
            </div>

            {/* Aviso de Render Cold Start */}
            {coldStartNotice && (
              <div style={{
                padding: '11px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                color: '#1d4ed8',
                fontSize: '0.84rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Loader2 size={16} className="spinner" />
                <span>{t.serverWaking}</span>
              </div>
            )}

            {/* Banner de Erro */}
            {error && (
              <div style={{
                padding: '12px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.85rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Formulário com Espaçamento Generoso */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Campo de E-mail */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '7px'
                }}>
                  {t.emailLabel} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '14px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px 0 44px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.9rem',
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
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '7px'
                }}>
                  {t.passwordLabel} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '14px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 44px 0 44px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.9rem',
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
                      right: '14px',
                      top: '14px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Checkbox Manter-me conectado & Link Esqueceu a Senha */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.84rem',
                marginTop: '2px',
                marginBottom: '4px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#0f172a', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{t.rememberMe}</span>
                </label>

                <span
                  onClick={() => {
                    setError(null);
                    setShowForgotModal(true);
                  }}
                  style={{
                    color: '#0f172a',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {t.forgotPassword}
                </span>
              </div>

              {/* Botão Principal: Entrar */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '46px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
                  transition: 'background 0.15s ease'
                }}
              >
                {loading && <Loader2 size={17} className="spinner" />}
                <span>{loading ? t.signingIn : t.signInButton}</span>
              </button>

              {/* Separador "Ou" Centralizado */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '4px 0',
                color: '#94a3b8',
                fontSize: '0.84rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span>{t.orDivider}</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Dois Botões Lado a Lado: Google & Apple */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24">
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
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.82.94-2.88-.91.04-2.02.6-2.66 1.36-.57.65-.98 1.73-.85 2.76 1.02.08 2.05-.53 2.57-1.24z"/>
                  </svg>
                  <span>{t.appleButton}</span>
                </button>
              </div>
            </form>

            {/* Aviso de Sistema Fechado */}
            <div style={{ textAlign: 'center', marginTop: '26px', fontSize: '0.86rem', color: '#64748b' }}>
              <span>{t.noAccount} </span>
              <span
                onClick={() => setShowAdminModal(true)}
                style={{
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textDecoration: 'underline'
                }}
              >
                {t.contactAdmin}
              </span>
            </div>
          </div>

          {/* BASE: COPYRIGHT À ESQUERDA E SUPORTE À DIREITA */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#94a3b8',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span>{t.copyright}</span>
            <span
              onClick={() => setShowAdminModal(true)}
              style={{
                cursor: 'pointer',
                color: '#64748b',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{t.needHelp}</span>
              <strong style={{ color: '#0f172a' }}>{t.contactSupport}</strong>
            </span>
          </div>
        </div>

        {/* ==================== COLUNA DIREITA: PRÉVIA DO SISTEMA (50%) ==================== */}
        <div style={{
          height: '100%',
          background: '#f6f7f9',
          borderLeft: '1px solid #f1f5f9',
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          {/* PRÉVIA DO DASHBOARD DO LEADSCOPE (PREENCHE A MAIOR PARTE DA COLUNA) */}
          <div style={{
            flex: 1,
            minHeight: '440px',
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Mini-Sidebar Interna da Prévia */}
            <div style={{
              width: '190px',
              borderRight: '1px solid #f1f5f9',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Logo do LeadScope no Canto Superior Esquerdo da Janela */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.74rem'
                    }}>
                      L
                    </div>
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>
                      LeadScope
                    </span>
                  </div>
                  <Layers size={13} color="#94a3b8" />
                </div>

                {/* Barra de Busca Interna */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 9px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.7rem',
                  color: '#94a3b8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Search size={12} />
                    <span>{t.searchPlaceholder}</span>
                  </div>
                  <span style={{ fontSize: '0.62rem', border: '1px solid #cbd5e1', borderRadius: '3px', padding: '1px 3px' }}>⌘K</span>
                </div>

                {/* Navegação Principal */}
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    {t.mainNav}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {/* Visão Geral Ativa */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 9px',
                      borderRadius: '5px',
                      background: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: '600',
                      fontSize: '0.74rem'
                    }}>
                      <LayoutDashboard size={13} color="#0f172a" />
                      <span>{t.overview}</span>
                    </div>

                    {/* Pipeline */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 9px',
                      color: '#334155',
                      fontSize: '0.74rem',
                      fontWeight: '500'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <FolderKanban size={13} />
                        <span>{t.pipeline}</span>
                      </div>
                      <ChevronDown size={12} />
                    </div>

                    {/* Submenu */}
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.68rem', color: '#64748b' }}>
                      <span>{t.allQueue}</span>
                      <span>{t.highPriority}</span>
                      <span>{t.escalations}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', color: '#64748b', fontSize: '0.74rem' }}>
                      <Building2 size={13} />
                      <span>{t.clients}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', color: '#64748b', fontSize: '0.74rem' }}>
                      <Users size={13} />
                      <span>{t.agentsTeams}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Análises & Insights */}
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  {t.analyticsInsights}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', color: '#64748b', fontSize: '0.74rem' }}>
                    <ShieldCheck size={13} />
                    <span>{t.slaCompliance}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', color: '#64748b', fontSize: '0.74rem' }}>
                    <TrendingUp size={13} />
                    <span>{t.csatNps}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', color: '#64748b', fontSize: '0.74rem' }}>
                    <FileBarChart size={13} />
                    <span>{t.reports}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Interno da Dashboard (Preenchendo Toda a Altura) */}
            <div style={{
              flex: 1,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              {/* Breadcrumb & Saudação */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '3px' }}>
                  {t.breadcrumb}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {t.greeting}
                  </h3>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981'
                  }}>
                    PROD ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  {t.greetingSub}
                </p>
              </div>

              {/* 2 Métricas Principais com Sparklines em SVG */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                    {t.currentLeads}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                      3.484
                    </span>
                    {/* Sparkline Verde */}
                    <svg width="50" height="20" viewBox="0 0 50 20">
                      <path d="M2,16 C12,16 16,7 26,10 C34,13 38,4 48,2" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600', marginTop: '4px' }}>
                    {t.leadsTrend}
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                    {t.dailyAvgClose}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                      486
                    </span>
                    {/* Sparkline Verde */}
                    <svg width="50" height="20" viewBox="0 0 50 20">
                      <path d="M2,14 C12,14 18,16 28,6 C36,11 40,4 48,3" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600', marginTop: '4px' }}>
                    {t.closeTrend}
                  </div>
                </div>
              </div>

              {/* Volume Trend Gráfico de Barras Expandido */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500', display: 'block' }}>
                      {t.ticketTrend}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                        4.790
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>
                        {t.ticketTrendBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7 Barras com Tooltip de Terça-Feira e Altura Generosa */}
                <div style={{ position: 'relative', paddingTop: '24px' }}>
                  {/* Tooltip 'Ter : 584' */}
                  <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '38%',
                    transform: 'translateX(-50%)',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '0.66rem',
                    fontWeight: '700',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{t.tueTooltip}</span>
                  </div>

                  {/* Linha pontilhada horizontal */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '42%',
                    right: '6%',
                    height: '1px',
                    borderTop: '1px dashed #cbd5e1',
                    zIndex: 1
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', gap: '10px' }}>
                    {[
                      { day: t.days[0], height: 38, active: false },
                      { day: t.days[1], height: 56, active: false },
                      { day: t.days[2], height: 92, active: true },
                      { day: t.days[3], height: 48, active: false },
                      { day: t.days[4], height: 72, active: false },
                      { day: t.days[5], height: 60, active: false },
                      { day: t.days[6], height: 36, active: false }
                    ].map(col => (
                      <div key={col.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '100%',
                          height: `${col.height}%`,
                          borderRadius: '5px',
                          background: col.active
                            ? 'linear-gradient(180deg, #1e293b 0%, #475569 100%)'
                            : '#e2e8f0',
                          transition: 'height 0.3s ease'
                        }} />
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: col.active ? '700' : '400' }}>
                          {col.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEPOIMENTO DE CLIENTE FIXO NO RODAPÉ DA COLUNA DIREITA */}
          <div style={{ marginTop: '26px' }}>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: '#1e293b',
              margin: '0 0 16px 0',
              fontWeight: '500',
              letterSpacing: '-0.01em'
            }}>
              <strong style={{ color: '#0f172a', fontWeight: '800' }}>
                {lang === 'pt' ? 'O LeadScope mudou completamente' : 'LeadScope has completely changed'}
              </strong>{' '}
              {lang === 'pt'
                ? 'como gerenciamos nossa prospecção. É rápido, intuitivo e nos dá '
                : 'how we manage customer support. It\'s fast, intuitive, and gives us '}
              <strong style={{ color: '#0f172a', fontWeight: '800' }}>
                {lang === 'pt' ? 'insights claros' : 'clear insights'}
              </strong>{' '}
              {lang === 'pt' ? 'que realmente importam.' : 'that actually matter.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.92rem',
                border: '2px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
              }}>
                SK
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                  {t.testimonialAuthor}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {t.testimonialRole}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODAL DE RECUPERAÇÃO DE SENHA (SUPABASE AUTH) ==================== */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
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
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
              {t.forgotModalTitle}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {t.forgotModalSub}
            </p>

            {forgotSuccess && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                color: '#059669',
                fontSize: '0.84rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div style={{
                padding: '12px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.84rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    {t.emailLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '12px' }} />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontSize: '0.86rem',
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
                    padding: '11px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {forgotLoading && <Loader2 size={16} className="spinner" />}
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
                  padding: '11px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
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
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <HelpCircle size={22} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
              {t.adminModalTitle}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {t.adminModalSub}
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '8px' }}>
                {t.adminContactTitle}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  suporte@leadscope.com
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={13} />
                  <span>{copiedEmail ? t.emailCopied : t.copyEmail}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              style={{
                width: '100%',
                padding: '11px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '600',
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
