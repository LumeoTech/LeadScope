import React, { useState, useEffect } from 'react';
import { api, UserInfo } from '../services/api';
import { Lock, Mail, User, Eye, EyeOff, Sun, Moon, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, TrendingUp, BarChart3, Check } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('crm_theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
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

    try {
      if (mode === 'REGISTER') {
        if (password !== confirmPassword) {
          setError('As senhas digitadas não coincidem.');
          setLoading(false);
          return;
        }

        await api.auth.register({
          name,
          email,
          password,
          confirmPassword
        });
        setSuccessMsg('Solicitação enviada com sucesso! Aguarde a aprovação do administrador para acessar o sistema.');
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
      setError(err.message || 'Erro ao processar solicitação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: isDark ? '#090a0c' : '#edece8',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Centered Modern Dual-Panel Card matching reference */}
      <div style={{
        width: '100%',
        maxWidth: '980px',
        minHeight: '600px',
        background: isDark ? '#111317' : '#ffffff',
        borderRadius: '10px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark
          ? '0 24px 48px rgba(0, 0, 0, 0.7)'
          : '0 20px 45px rgba(0, 0, 0, 0.06)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        overflow: 'hidden'
      }}>
        {/* ==================== LEFT SIDE: AUTH FORM ==================== */}
        <div style={{
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isDark ? '#111317' : '#ffffff'
        }}>
          {/* Top Bar: Minimal Logo + Theme toggle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isDark ? '#ffffff' : '#0f172a',
                  color: isDark ? '#0f172a' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '1rem',
                  letterSpacing: '-0.03em'
                }}>
                  L
                </div>
                <span style={{
                  fontWeight: '700',
                  fontSize: '1rem',
                  letterSpacing: '-0.02em',
                  color: isDark ? '#ffffff' : '#0f172a'
                }}>
                  LeadScope
                </span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  background: 'transparent',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '5px',
                  padding: '5px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: '600'
                }}
              >
                {isDark ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#1e3a5f" />}
                <span>{isDark ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '1.45rem',
                fontWeight: '700',
                letterSpacing: '-0.025em',
                color: isDark ? '#ffffff' : '#0f172a',
                margin: 0
              }}>
                {mode === 'LOGIN' ? 'Sign In to Continue' : 'Solicitar Cadastro'}
              </h1>
              <p style={{
                fontSize: '0.82rem',
                color: isDark ? '#8b949e' : '#64748b',
                marginTop: '4px',
                marginBottom: 0
              }}>
                {mode === 'LOGIN'
                  ? 'Access all your tools in one place.'
                  : 'Seu cadastro passará pela aprovação de um Administrador.'}
              </p>
            </div>

            {/* Success & Error Banners */}
            {successMsg && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                color: '#34d399',
                fontSize: '0.8rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'REGISTER' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.77rem',
                    fontWeight: '600',
                    color: isDark ? '#c9d1d9' : '#334155',
                    marginBottom: '5px'
                  }}>
                    Nome Completo *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Gabriel Castro"
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        background: isDark ? '#16191f' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.77rem',
                  fontWeight: '600',
                  color: isDark ? '#c9d1d9' : '#334155',
                  marginBottom: '5px'
                }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="achmadhakim@gmail.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      background: isDark ? '#16191f' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.77rem',
                  fontWeight: '600',
                  color: isDark ? '#c9d1d9' : '#334155',
                  marginBottom: '5px'
                }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 36px 8px 36px',
                      background: isDark ? '#16191f' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? '#6e7681' : '#94a3b8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === 'REGISTER' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.77rem',
                    fontWeight: '600',
                    color: isDark ? '#c9d1d9' : '#334155',
                    marginBottom: '5px'
                  }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color={isDark ? '#6e7681' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        background: isDark ? '#16191f' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '0.82rem',
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
                fontSize: '0.76rem',
                marginTop: '2px',
                marginBottom: '4px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: isDark ? '#8b949e' : '#475569',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#1e3a5f', cursor: 'pointer' }}
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
                      color: isDark ? '#93c5fd' : '#2563eb',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  background: isDark ? '#1e3a5f' : '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{loading ? 'Processando...' : (mode === 'LOGIN' ? 'Sign In' : 'Solicitar Cadastro')}</span>
              </button>
            </form>

            {/* Mode Switcher */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: isDark ? '#8b949e' : '#64748b' }}>
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
                      color: isDark ? '#93c5fd' : '#2563eb',
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
                      color: isDark ? '#93c5fd' : '#2563eb',
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

          {/* Bottom Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: isDark ? '#484f58' : '#94a3b8',
            marginTop: '36px',
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

        {/* ==================== RIGHT SIDE: DASHBOARD PREVIEW & SOCIAL PROOF ==================== */}
        <div style={{
          background: isDark ? '#0d0f12' : '#f7f8fa',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
          padding: '36px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Mockup Preview Card */}
          <div style={{
            background: isDark ? '#16191f' : '#ffffff',
            borderRadius: '8px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            padding: '20px',
            boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.04)'
          }}>
            {/* Header of preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: isDark ? '#8b949e' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>LeadScope</span>
                <span>/</span>
                <span>Dashboard Operacional</span>
              </div>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981'
              }}>
                PROD ACTIVE
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.98rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                Hello, Gabriel Castro 👋
              </div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#8b949e' : '#64748b', marginTop: '2px' }}>
                Visão consolidada de oportunidades qualificadas e conversão em tempo real.
              </div>
            </div>

            {/* 2 Metric Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                padding: '10px 12px',
                background: isDark ? '#111317' : '#f8fafc',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b' }}>Leads Qualificados</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', marginTop: '2px' }}>
                  3,484
                </div>
                <div style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
                  +71% vs last week
                </div>
              </div>

              <div style={{
                padding: '10px 12px',
                background: isDark ? '#111317' : '#f8fafc',
                borderRadius: '6px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#8b949e' : '#64748b' }}>Taxa Média de Aceite</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', marginTop: '2px' }}>
                  86%
                </div>
                <div style={{ fontSize: '0.66rem', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
                  +14% assertividade
                </div>
              </div>
            </div>

            {/* Mini Trend Volume preview */}
            <div style={{
              padding: '12px',
              background: isDark ? '#111317' : '#f8fafc',
              borderRadius: '6px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#8b949e' : '#64748b' }}>Volume de Oportunidades</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>4,790</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '36px' }}>
                {[30, 45, 28, 60, 80, 52, 95, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: i === 6 ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'),
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Social Proof / Testimonial Quote matching reference */}
          <div style={{ marginTop: '24px' }}>
            <p style={{
              fontSize: '0.88rem',
              lineHeight: '1.5',
              color: isDark ? '#e6edf3' : '#1e293b',
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>LeadScope has completely changed</strong> how we manage commercial intelligence and enterprise prospecting. It's fast, intuitive, and gives us clear insights that actually matter.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1e3a5f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.85rem',
                border: '1.5px solid rgba(255,255,255,0.2)'
              }}>
                GC
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Gabriel Castro
                </div>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#8b949e' : '#64748b' }}>
                  Head of Growth & Commercial Intelligence — LumeoTech
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
