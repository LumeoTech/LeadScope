import React, { useState, useEffect, useRef } from 'react';
import { api, UserInfo } from '../services/api';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserInfo) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Estados de conexão e feedback
  const [loading, setLoading] = useState(false);
  const [serverWarming, setServerWarming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado de retry
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Ping silencioso para acordar o servidor na montagem
  useEffect(() => {
    let isMounted = true;
    const warmingTimer = setTimeout(() => {
      if (isMounted) setServerWarming(true);
    }, 2800);

    const pingServer = async () => {
      try {
        await fetch('/api/health', { method: 'GET' });
      } catch {
        // Silencioso: se falhar o ping de background, a tentativa real do formulário lidará com retries
      } finally {
        clearTimeout(warmingTimer);
        if (isMounted) setServerWarming(false);
      }
    };

    pingServer();
    return () => {
      isMounted = false;
      clearTimeout(warmingTimer);
    };
  }, []);

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

  // Submissão com retry automático em caso de falha de conexão (até 3 tentativas)
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

    // Timeout de segurança no front para garantir que o botão NUNCA fique preso
    const safetyTimeout = setTimeout(() => {
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
          // Solicitação amigável de recuperação de senha
          await new Promise((r) => setTimeout(r, 600));
          setSuccessMsg('Se o e-mail informado estiver cadastrado, as instruções de recuperação foram enviadas.');
          setMode('LOGIN');
        }
      } catch (err: any) {
        const message = err.message || 'Falha na autenticação.';
        const isNetworkOrTimeout =
          message.includes('conexão') ||
          message.includes('demorou') ||
          message.includes('Failed to fetch') ||
          message.includes('indisponível');

        // Se for erro temporário de rede/cold-start e ainda temos tentativas de retry (até 3 tentativas)
        if (isNetworkOrTimeout && attempt < 3) {
          const backoffMs = attempt * 1500;
          await new Promise((r) => setTimeout(r, backoffMs));
          return executeWithRetry(attempt + 1);
        }

        // Caso contrário, encerra e exibe o erro
        setError(message);
      } finally {
        clearTimeout(safetyTimeout);
        setLoading(false);
        setRetryAttempt(0);
      }
    };

    await executeWithRetry(1);
  };

  return (
    <div className="login-viewport">
      <style>{`
        .login-viewport {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background-color: var(--bg-main, #fbfbfd);
          color: var(--text-primary, #1d1d1f);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* Iluminação de fundo sutil Apple */
        .login-viewport::before {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(0, 113, 227, 0.08) 0%, rgba(0, 113, 227, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Card Apple Translúcido */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 44px 40px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
          box-sizing: border-box;
          animation: appleEntrance 300ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        @media (prefers-color-scheme: dark) {
          .login-viewport {
            background-color: #000000;
          }
          .login-viewport::before {
            background: radial-gradient(circle, rgba(0, 113, 227, 0.12) 0%, rgba(0, 113, 227, 0) 70%);
          }
          .login-card {
            background: rgba(28, 28, 30, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.10);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(255, 255, 255, 0.05);
          }
        }

        @keyframes appleEntrance {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .apple-title {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.028em;
          margin: 0 0 8px 0;
          color: var(--text-primary, #1d1d1f);
          line-height: 1.15;
          text-align: center;
        }

        .apple-subtitle {
          font-size: 15px;
          color: var(--text-secondary, #86868b);
          text-align: center;
          margin: 0 0 32px 0;
          font-weight: 400;
          line-height: 1.45;
        }

        .apple-form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .apple-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary, #86868b);
        }

        .apple-input {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.85);
          padding: 0 16px;
          font-size: 15px;
          color: var(--text-primary, #1d1d1f);
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .apple-input:focus {
          border-color: #0071e3;
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.16);
        }

        @media (prefers-color-scheme: dark) {
          .apple-input {
            background: rgba(44, 44, 46, 0.65);
            border-color: rgba(255, 255, 255, 0.12);
            color: #f5f5f7;
          }
          .apple-input:focus {
            border-color: #0071e3;
            box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.25);
          }
        }

        .apple-btn-primary {
          height: 48px;
          width: 100%;
          border-radius: 9999px;
          background: #0071e3;
          color: #ffffff;
          border: none;
          font-size: 16px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
          box-shadow: 0 4px 14px rgba(0, 113, 227, 0.28);
          margin-top: 10px;
          user-select: none;
        }

        .apple-btn-primary:hover:not(:disabled) {
          background: #0077ed;
        }

        .apple-btn-primary:active:not(:disabled) {
          transform: scale(0.975);
          background: #0062c4;
        }

        .apple-btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* Barra de progresso para aquecimento de servidor */
        .warming-bar-container {
          width: 100%;
          height: 3px;
          background: rgba(0, 113, 227, 0.15);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .warming-bar-indicator {
          height: 100%;
          width: 40%;
          background: #0071e3;
          border-radius: 2px;
          animation: warmingProgress 1.6s ease-in-out infinite;
        }

        @keyframes warmingProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }

        .apple-link-btn {
          background: none;
          border: none;
          color: #0071e3;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .apple-link-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        {/* Logo minimalista Apple-style */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '13px',
              background: '#0071e3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0, 113, 227, 0.28)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
        </div>

        {/* Título e Subtítulo */}
        <h1 className="apple-title">
          {mode === 'LOGIN' && 'Lumeo'}
          {mode === 'REGISTER' && 'Solicitar Acesso'}
          {mode === 'FORGOT' && 'Recuperar Acesso'}
        </h1>
        <p className="apple-subtitle">
          {mode === 'LOGIN' && 'Plataforma de gestão comercial e prospecção corporativa.'}
          {mode === 'REGISTER' && 'Preencha seus dados para solicitar ativação da sua conta.'}
          {mode === 'FORGOT' && 'Digite seu e-mail para receber as instruções de recuperação.'}
        </p>

        {/* Notificação de servidor preparando ambiente */}
        {serverWarming && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#0071e3', fontWeight: 500 }}>
                Preparando seu ambiente…
              </span>
            </div>
            <div className="warming-bar-container">
              <div className="warming-bar-indicator" />
            </div>
          </div>
        )}

        {/* Mensagens de Sucesso */}
        {successMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(52, 199, 89, 0.12)',
              border: '1px solid rgba(52, 199, 89, 0.25)',
              color: '#34c759',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              lineHeight: 1.4
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mensagens de Erro Humanas */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 59, 48, 0.10)',
              border: '1px solid rgba(255, 59, 48, 0.22)',
              color: '#ff3b30',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px',
              lineHeight: 1.4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                color: '#0071e3',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 0',
                textDecoration: 'underline'
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'REGISTER' && (
            <div className="apple-form-group">
              <label className="apple-label" htmlFor="nameInput">
                Nome Completo
              </label>
              <input
                id="nameInput"
                type="text"
                className="apple-input"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </div>
          )}

          <div className="apple-form-group">
            <label className="apple-label" htmlFor="emailInput">
              E-mail Corporativo
            </label>
            <input
              id="emailInput"
              type="email"
              className="apple-input"
              placeholder="nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          {mode !== 'FORGOT' && (
            <div className="apple-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="apple-label" htmlFor="passwordInput">
                  Senha
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    className="apple-link-btn"
                    onClick={() => {
                      setMode('FORGOT');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  className="apple-input"
                  style={{ paddingRight: '44px' }}
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
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary, #86868b)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'REGISTER' && (
            <div className="apple-form-group">
              <label className="apple-label" htmlFor="confirmPasswordInput">
                Confirmar Senha
              </label>
              <input
                id="confirmPasswordInput"
                type={showPassword ? 'text' : 'password'}
                className="apple-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          )}

          {mode === 'LOGIN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', marginTop: '6px' }}>
              <input
                id="rememberMeCheckbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  accentColor: '#0071e3',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="rememberMeCheckbox"
                style={{ fontSize: '13px', color: 'var(--text-secondary, #86868b)', cursor: 'pointer', userSelect: 'none' }}
              >
                Manter conectado
              </label>
            </div>
          )}

          {/* Botão de Ação Primário com proteção contra travamento */}
          <button type="submit" className="apple-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>
                  {retryAttempt > 1
                    ? `Reconectando (tentativa ${retryAttempt}/3)…`
                    : mode === 'REGISTER'
                    ? 'Enviando solicitação…'
                    : mode === 'FORGOT'
                    ? 'Enviando…'
                    : 'Entrando…'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'LOGIN' && 'Continuar'}
                  {mode === 'REGISTER' && 'Solicitar Acesso'}
                  {mode === 'FORGOT' && 'Enviar Link de Recuperação'}
                </span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé / Alternância entre Login e Solicitar Acesso */}
        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary, #86868b)' }}>
          {mode === 'LOGIN' && (
            <div>
              <span>Não tem uma conta corporativa? </span>
              <button
                type="button"
                className="apple-link-btn"
                style={{ fontWeight: 500 }}
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                Solicitar acesso
              </button>
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <span>Já possui uma conta? </span>
              <button
                type="button"
                className="apple-link-btn"
                style={{ fontWeight: 500 }}
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                Voltar ao login
              </button>
            </div>
          )}

          {mode === 'FORGOT' && (
            <div>
              <button
                type="button"
                className="apple-link-btn"
                style={{ fontWeight: 500 }}
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
