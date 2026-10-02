import React, { useState, useEffect, useRef } from 'react';
import { api, UserInfo } from '../services/api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserInfo) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [lang, setLang] = useState<'PT' | 'EN'>('PT');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Estados de feedback e conexão
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverWarming, setServerWarming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Modal de suporte
  const [showSupportModal, setShowSupportModal] = useState(false);

  // 1. Ping silencioso em /api/health para acordar o backend
  useEffect(() => {
    let isMounted = true;
    const warmingTimer = setTimeout(() => {
      if (isMounted) setServerWarming(true);
    }, 2500);

    fetch('/api/health', { method: 'GET' })
      .catch(() => {})
      .finally(() => {
        clearTimeout(warmingTimer);
        if (isMounted) setServerWarming(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(warmingTimer);
    };
  }, []);

  // 2. Inicialização do Google Identity Services (GIS)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId || !window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } catch (e) {
      console.warn('Erro ao inicializar Google Identity Services:', e);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setError('Autenticação com Google cancelada ou não autorizada.');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    try {
      const authRes = await api.auth.google(response.credential);
      const token = authRes.accessToken;
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(authRes.user));
        localStorage.setItem('crm_auth_token', token);
        localStorage.setItem('crm_user_info', JSON.stringify(authRes.user));
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(authRes.user));
        sessionStorage.setItem('crm_auth_token', token);
        sessionStorage.setItem('crm_user_info', JSON.stringify(authRes.user));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      onLoginSuccess(authRes.user);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar com Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLoginClick = () => {
    setError(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Se o OneTap não puder ser exibido, tenta popup nativo
          tryOAuthPopup();
        }
      });
    } else {
      tryOAuthPopup();
    }
  };

  const tryOAuthPopup = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      // Modo de demonstração guiado caso GOOGLE_CLIENT_ID ainda não esteja no .env
      const demoEmail = prompt('Digite seu e-mail do Google para demonstração:');
      if (demoEmail && demoEmail.includes('@')) {
        setName(demoEmail.split('@')[0]);
        setEmail(demoEmail.trim().toLowerCase());
        setPassword('demo123456');
        setError('Para login automático com 1 clique, adicione GOOGLE_CLIENT_ID no seu .env.');
      }
      return;
    }

    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&nonce=${Date.now()}`;
    window.location.href = authUrl;
  };

  const handleAppleLoginClick = () => {
    setError('Login com Apple requer configuração de credenciais Apple Developer no ambiente.');
  };

  // Validação no cliente
  const validateForm = (): string | null => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return 'Informe seu e-mail corporativo.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return 'Digite um endereço de e-mail válido.';

    if (mode === 'REGISTER') {
      if (!name.trim()) return 'Informe seu nome completo.';
      if (!password || password.length < 6) return 'A senha deve conter no mínimo 6 caracteres.';
      if (password !== confirmPassword) return 'As senhas digitadas não coincidem.';
    } else if (mode === 'LOGIN') {
      if (!password) return 'Informe sua senha de acesso.';
    }

    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccessMsg(null);

    const clientError = validateForm();
    if (clientError) {
      setError(clientError);
      return;
    }

    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setError('O servidor demorou para responder. Por favor, tente novamente.');
    }, 60000);

    const executeWithRetry = async (attempt: number): Promise<void> => {
      try {
        setRetryAttempt(attempt);

        if (mode === 'REGISTER') {
          await api.auth.register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            confirmPassword
          });
          setSuccessMsg('Solicitação de acesso enviada com sucesso! Aguarde a aprovação do administrador.');
          setMode('LOGIN');
          setPassword('');
          setConfirmPassword('');
        } else if (mode === 'LOGIN') {
          const response = await api.auth.login({
            email: email.trim().toLowerCase(),
            password
          });

          const token = response.accessToken || (response as any).token;

          if (rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('crm_auth_token', token);
            localStorage.setItem('crm_user_info', JSON.stringify(response.user));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(response.user));
            sessionStorage.setItem('crm_auth_token', token);
            sessionStorage.setItem('crm_user_info', JSON.stringify(response.user));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }

          onLoginSuccess(response.user);
        } else if (mode === 'FORGOT') {
          await new Promise((r) => setTimeout(r, 600));
          setSuccessMsg('Se o e-mail informado estiver cadastrado, as instruções foram enviadas.');
          setMode('LOGIN');
        }
      } catch (err: any) {
        const message = err.message || 'Falha na autenticação.';
        const isNetwork =
          message.includes('conexão') ||
          message.includes('demorou') ||
          message.includes('Failed to fetch') ||
          message.includes('indisponível');

        if (isNetwork && attempt < 3) {
          const backoff = attempt * 1500;
          await new Promise((r) => setTimeout(r, backoff));
          return executeWithRetry(attempt + 1);
        }

        setError(message);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
        setRetryAttempt(0);
      }
    };

    await executeWithRetry(1);
  };

  return (
    <div className="kravio-page">
      <style>{`
        .kravio-page {
          min-height: 100vh;
          width: 100vw;
          background-color: #ebe9e6;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          font-family: "SF Pro Text", "SF Pro Display", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #1d1d1f;
        }

        /* Card Principal Estilo Kravio */
        .kravio-card {
          width: 100%;
          max-width: 1100px;
          min-height: 640px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
          display: flex;
          overflow: hidden;
          box-sizing: border-box;
          animation: kravioEntrance 300ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        @keyframes kravioEntrance {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Coluna Esquerda: Formulário */
        .kravio-left {
          flex: 1;
          padding: 32px 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          box-sizing: border-box;
        }

        /* Topo Coluna Esquerda */
        .kravio-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .lumeo-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .lumeo-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #1d1d1f;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lumeo-brand-text {
          font-size: 17px;
          font-weight: 700;
          color: #1d1d1f;
          letter-spacing: -0.02em;
        }

        .lang-selector-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 500;
          color: #6e6e73;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }

        .lang-selector-btn:hover {
          background: rgba(0, 0, 0, 0.04);
          color: #1d1d1f;
        }

        /* Bloco Central do Form (Máx 360px) */
        .kravio-form-center {
          width: 100%;
          max-width: 360px;
          margin: 28px auto;
        }

        .kravio-title {
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #1d1d1f;
          text-align: center;
          margin: 0 0 6px 0;
        }

        .kravio-subtitle {
          font-size: 13px;
          color: #6e6e73;
          text-align: center;
          margin: 0 0 24px 0;
        }

        .kravio-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #1d1d1f;
          margin-bottom: 6px;
        }

        .kravio-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .kravio-input-icon {
          position: absolute;
          left: 12px;
          color: #86868b;
          pointer-events: none;
        }

        .kravio-input {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #d2d2d7;
          background: #ffffff;
          padding: 0 12px 0 38px;
          font-size: 14px;
          color: #1d1d1f;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .kravio-input:focus {
          border-color: #1d1d1f;
          box-shadow: 0 0 0 3px rgba(29, 29, 31, 0.12);
        }

        .kravio-btn-primary {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          background: #1d2433;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          margin-top: 18px;
          user-select: none;
        }

        .kravio-btn-primary:hover:not(:disabled) {
          background: #2b3548;
        }

        .kravio-btn-primary:active:not(:disabled) {
          transform: scale(0.985);
        }

        .kravio-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divisor "ou" */
        .kravio-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #86868b;
          font-size: 12px;
        }

        .kravio-divider::before,
        .kravio-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e5ea;
        }

        .kravio-divider span {
          padding: 0 12px;
        }

        /* Botões Sociais */
        .kravio-social-row {
          display: flex;
          gap: 12px;
          margin-bottom: 22px;
        }

        .kravio-social-btn {
          flex: 1;
          height: 40px;
          background: #ffffff;
          border: 1px solid #d2d2d7;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #1d1d1f;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s;
          user-select: none;
        }

        .kravio-social-btn:hover {
          background: #fbfbfd;
          border-color: #b0b0b8;
        }

        .kravio-bottom-link {
          text-align: center;
          font-size: 13px;
          color: #6e6e73;
        }

        .kravio-bottom-link a,
        .kravio-bottom-link button {
          color: #1d1d1f;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          font-family: inherit;
        }

        /* Rodapé Coluna Esquerda */
        .kravio-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #86868b;
          width: 100%;
          border-top: 1px solid #f2f2f7;
          padding-top: 16px;
          margin-top: 16px;
        }

        .kravio-footer-link {
          color: #86868b;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-family: inherit;
          padding: 0;
        }

        .kravio-footer-link:hover {
          color: #1d1d1f;
        }

        /* Coluna Direita: Preview */
        .kravio-right {
          flex: 1;
          padding: 16px;
          display: flex;
          min-width: 0;
          box-sizing: border-box;
        }

        .kravio-preview-panel {
          flex: 1;
          background: #f1f0ee;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          padding: 28px 28px 36px 28px;
          box-sizing: border-box;
          justify-content: space-between;
        }

        /* Topo Preview: Screenshot cortada à direita e abaixo */
        .kravio-screenshot-container {
          position: relative;
          width: 120%;
          height: 330px;
          border-radius: 12px 0 0 12px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          background: #000000;
        }

        .kravio-screenshot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top left;
          display: block;
        }

        .kravio-screenshot-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(241, 240, 238, 0) 65%, #f1f0ee 100%);
          pointer-events: none;
        }

        /* Frase de Valor */
        .kravio-value-phrase {
          font-size: 18px;
          line-height: 1.45;
          color: #1d1d1f;
          font-weight: 400;
          margin-top: 24px;
        }

        .kravio-value-phrase strong {
          font-weight: 600;
          color: #1d1d1f;
        }

        /* Barra de Cold Start */
        .kravio-warming-bar {
          height: 3px;
          width: 100%;
          background: rgba(0, 113, 227, 0.15);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .kravio-warming-fill {
          height: 100%;
          width: 35%;
          background: #0071e3;
          border-radius: 2px;
          animation: warmingSlide 1.5s ease-in-out infinite;
        }
        @keyframes warmingSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }

        /* Responsividade Mobile (<900px) */
        @media (max-width: 900px) {
          .kravio-right {
            display: none !important;
          }
          .kravio-card {
            max-width: 480px;
            min-height: auto;
          }
          .kravio-left {
            padding: 28px 24px;
          }
        }
      `}</style>

      <div className="kravio-card">
        {/* ==================== COLUNA ESQUERDA: FORMULÁRIO ==================== */}
        <div className="kravio-left">
          {/* 1. Topo: Logo Lumeo e Seletor de Idioma */}
          <div className="kravio-top-bar">
            <div className="lumeo-brand">
              <div className="lumeo-logo-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 6C7 4.89543 7.89543 4 9 4H10C11.1046 4 12 4.89543 12 6V18C12 19.1046 12.8954 20 14 20H17C18.1046 20 19 19.1046 19 18V12"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="17" cy="8" r="2" fill="#34c759" />
                </svg>
              </div>
              <span className="lumeo-brand-text">Lumeo</span>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="lang-selector-btn"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                aria-label="Selecionar idioma"
              >
                <Globe size={15} />
                <span>{lang}</span>
                <ChevronDown size={13} />
              </button>

              {showLangDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: '#ffffff',
                    border: '1px solid #d2d2d7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    zIndex: 20,
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setLang('PT'); setShowLangDropdown(false); }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 16px', background: 'none',
                      border: 'none', textAlign: 'left', fontSize: '13px', cursor: 'pointer',
                      color: lang === 'PT' ? '#0071e3' : '#1d1d1f'
                    }}
                  >
                    Português (PT)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('EN'); setShowLangDropdown(false); }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 16px', background: 'none',
                      border: 'none', textAlign: 'left', fontSize: '13px', cursor: 'pointer',
                      color: lang === 'EN' ? '#0071e3' : '#1d1d1f'
                    }}
                  >
                    English (EN)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Bloco Central (Máx 360px) */}
          <div className="kravio-form-center">
            <h1 className="kravio-title">
              {mode === 'LOGIN' && (lang === 'PT' ? 'Entrar para continuar' : 'Sign in to continue')}
              {mode === 'REGISTER' && (lang === 'PT' ? 'Criar sua conta' : 'Create your account')}
              {mode === 'FORGOT' && (lang === 'PT' ? 'Recuperar senha' : 'Reset password')}
            </h1>
            <p className="kravio-subtitle">
              {mode === 'LOGIN' && (lang === 'PT' ? 'Acesse tudo em um só lugar.' : 'Access everything in one place.')}
              {mode === 'REGISTER' && (lang === 'PT' ? 'Solicite acesso ao workspace corporativo.' : 'Request corporate workspace access.')}
              {mode === 'FORGOT' && (lang === 'PT' ? 'Instruções serão enviadas para o seu e-mail.' : 'Instructions will be sent to your email.')}
            </p>

            {/* Aviso de Servidor Frio */}
            {serverWarming && (
              <div>
                <span style={{ fontSize: '12px', color: '#0071e3', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Preparando seu ambiente…
                </span>
                <div className="kravio-warming-bar">
                  <div className="kravio-warming-fill" />
                </div>
              </div>
            )}

            {/* Sucesso */}
            {successMsg && (
              <div style={{
                padding: '10px 12px', borderRadius: '8px', background: 'rgba(52, 199, 89, 0.12)',
                border: '1px solid rgba(52, 199, 89, 0.25)', color: '#248a3d', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div style={{
                padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 59, 48, 0.10)',
                border: '1px solid rgba(255, 59, 48, 0.2)', color: '#ff3b30', fontSize: '13px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  style={{
                    background: 'none', border: 'none', color: '#0071e3', fontSize: '12px',
                    fontWeight: 600, cursor: 'pointer', padding: '4px 0 0 24px', textDecoration: 'underline'
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {mode === 'REGISTER' && (
                <div>
                  <label className="kravio-label" htmlFor="kravioName">
                    {lang === 'PT' ? 'Nome Completo' : 'Full Name'}
                  </label>
                  <div className="kravio-input-wrap">
                    <Mail size={16} className="kravio-input-icon" style={{ opacity: 0 }} />
                    <input
                      id="kravioName"
                      type="text"
                      className="kravio-input"
                      style={{ paddingLeft: '14px' }}
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Input E-mail */}
              <div>
                <label className="kravio-label" htmlFor="kravioEmail">
                  {lang === 'PT' ? 'E-mail' : 'Email'}
                </label>
                <div className="kravio-input-wrap">
                  <Mail size={16} className="kravio-input-icon" />
                  <input
                    id="kravioEmail"
                    type="email"
                    className="kravio-input"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Input Senha */}
              {mode !== 'FORGOT' && (
                <div>
                  <label className="kravio-label" htmlFor="kravioPassword">
                    {lang === 'PT' ? 'Senha' : 'Password'}
                  </label>
                  <div className="kravio-input-wrap">
                    <Lock size={16} className="kravio-input-icon" />
                    <input
                      id="kravioPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="kravio-input"
                      style={{ paddingRight: '38px' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', background: 'none', border: 'none',
                        color: '#86868b', cursor: 'pointer', padding: '4px', display: 'flex'
                      }}
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'REGISTER' && (
                <div>
                  <label className="kravio-label" htmlFor="kravioConfirmPass">
                    {lang === 'PT' ? 'Confirmar Senha' : 'Confirm Password'}
                  </label>
                  <div className="kravio-input-wrap">
                    <Lock size={16} className="kravio-input-icon" />
                    <input
                      id="kravioConfirmPass"
                      type={showPassword ? 'text' : 'password'}
                      className="kravio-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Linha Manter conectado / Esqueceu a senha */}
              {mode === 'LOGIN' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0 16px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d1d1f', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#1d2433', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                    <span>{lang === 'PT' ? 'Manter-me conectado' : 'Keep me logged in'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT'); setError(null); setSuccessMsg(null); }}
                    style={{ background: 'none', border: 'none', color: '#1d1d1f', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}
                  >
                    {lang === 'PT' ? 'Esqueceu a senha?' : 'Forgot password?'}
                  </button>
                </div>
              )}

              {/* Botão Entrar */}
              <button type="submit" className="kravio-btn-primary" disabled={loading || googleLoading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>
                      {retryAttempt > 1
                        ? `Reconectando (${retryAttempt}/3)…`
                        : lang === 'PT' ? 'Entrando…' : 'Signing in…'}
                    </span>
                  </>
                ) : (
                  <span>
                    {mode === 'LOGIN' && (lang === 'PT' ? 'Entrar' : 'Sign in')}
                    {mode === 'REGISTER' && (lang === 'PT' ? 'Criar conta' : 'Create account')}
                    {mode === 'FORGOT' && (lang === 'PT' ? 'Enviar instruções' : 'Send instructions')}
                  </span>
                )}
              </button>
            </form>

            {/* Divisor "ou" */}
            {mode === 'LOGIN' && (
              <>
                <div className="kravio-divider">
                  <span>{lang === 'PT' ? 'ou' : 'or'}</span>
                </div>

                {/* Dois botões: Entrar com Google e Entrar com Apple */}
                <div className="kravio-social-row">
                  <button
                    type="button"
                    className="kravio-social-btn"
                    onClick={handleGoogleLoginClick}
                    disabled={googleLoading || loading}
                    title="Entrar com Google"
                  >
                    {googleLoading ? (
                      <Loader2 size={16} className="spin-animation" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="kravio-social-btn"
                    onClick={handleAppleLoginClick}
                    disabled={loading}
                    title="Entrar com Apple"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#000000">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.07-1.85.95-2.94-.95.04-2.07.64-2.73 1.41-.58.67-1.1 1.76-.96 2.82 1.05.08 2.11-.53 2.74-1.29z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </>
            )}

            {/* Alternância Criar conta / Entrar */}
            <div className="kravio-bottom-link">
              {mode === 'LOGIN' && (
                <span>
                  Não tem conta?{' '}
                  <button type="button" onClick={() => { setMode('REGISTER'); setError(null); setSuccessMsg(null); }}>
                    Criar conta
                  </button>
                </span>
              )}
              {mode === 'REGISTER' && (
                <span>
                  Já possui uma conta?{' '}
                  <button type="button" onClick={() => { setMode('LOGIN'); setError(null); setSuccessMsg(null); }}>
                    Entrar
                  </button>
                </span>
              )}
              {mode === 'FORGOT' && (
                <button type="button" onClick={() => { setMode('LOGIN'); setError(null); setSuccessMsg(null); }}>
                  Voltar ao login
                </button>
              )}
            </div>
          </div>

          {/* 3. Rodapé: © 2026 Lumeo à esquerda e Precisa de ajuda? à direita */}
          <div className="kravio-footer">
            <span>© 2026 Lumeo</span>
            <button
              type="button"
              className="kravio-footer-link"
              onClick={() => setShowSupportModal(true)}
            >
              Precisa de ajuda? Falar com suporte
            </button>
          </div>
        </div>

        {/* ==================== COLUNA DIREITA: PREVIEW ==================== */}
        <div className="kravio-right">
          <div className="kravio-preview-panel">
            {/* Screenshot Real do Dashboard */}
            <div className="kravio-screenshot-container">
              <img
                src="/assets/dashboard-preview-light.png"
                alt="Dashboard Lumeo"
                className="kravio-screenshot-img"
                loading="eager"
              />
              <div className="kravio-screenshot-overlay" />
            </div>

            {/* Frase de Valor */}
            <div className="kravio-value-phrase">
              O Lumeo transforma prospecção em <strong>receita previsível</strong>. É rápido, intuitivo e dá <strong>clareza</strong> sobre o que importa.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Simples de Suporte */}
      {showSupportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px'
          }}
          onClick={() => setShowSupportModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px 28px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#1d1d1f' }}>
              Suporte Lumeo
            </h3>
            <p style={{ fontSize: '13px', color: '#6e6e73', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Para dúvidas técnicas ou liberação de novos acessos corporativos, nossa equipe de suporte está à disposição:
            </p>
            <div style={{ background: '#f5f5f7', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#1d1d1f', marginBottom: '20px' }}>
              <strong>E-mail:</strong> suporte@lumeo.com
            </div>
            <button
              type="button"
              className="kravio-btn-primary"
              style={{ marginTop: 0 }}
              onClick={() => setShowSupportModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
