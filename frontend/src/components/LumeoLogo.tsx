import React from 'react';

interface LumeoLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export const LumeoLogo: React.FC<LumeoLogoProps> = ({
  size = 32,
  showText = true,
  textColor
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size > 30 ? '10px' : '8px' }}>
      {/* Símbolo Minimalista e Moderno da Marca Lumeo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, borderRadius: `${size * 0.26}px` }}
      >
        <defs>
          <linearGradient id="lumeoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="lumeoMarkGrad" x1="20%" y1="20%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
          <filter id="lumeoGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Fundo Arredondado */}
        <rect
          width="100"
          height="100"
          rx="26"
          fill="url(#lumeoBgGrad)"
        />

        {/* Letra 'L' estilizada e arquitetada */}
        <path
          d="M 32 24 
             C 32 20.686, 34.686 18, 38 18 
             C 41.314 18, 44 20.686, 44 24 
             L 44 64 
             C 44 66.209, 45.791 68, 48 68 
             L 68 68 
             C 71.314 68, 74 70.686, 74 74 
             C 74 77.314, 71.314 80, 68 80 
             L 40 80 
             C 35.582 80, 32 76.418, 32 72 
             Z"
          fill="url(#lumeoMarkGrad)"
          filter="url(#lumeoGlow)"
        />

        {/* Ponto focal de luminosidade */}
        <circle cx="68" cy="40" r="5" fill="#38bdf8" opacity="0.9" />
      </svg>

      {showText && (
        <span style={{
          fontSize: size > 30 ? '1.35rem' : '1.12rem',
          fontWeight: '700',
          color: textColor || 'var(--text-primary)',
          letterSpacing: '-0.025em',
          lineHeight: 1,
          fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif"
        }}>
          Lumeo
        </span>
      )}
    </div>
  );
};
