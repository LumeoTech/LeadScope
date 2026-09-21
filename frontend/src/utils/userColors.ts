export interface UserColorTheme {
  primary: string;
  border: string;
  bg: string;
  bgSubtle: string;
  text: string;
  glow: string;
  badgeBg: string;
}

const PALETTES: UserColorTheme[] = [
  {
    primary: '#3b82f6', // Blue
    border: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    bgSubtle: 'rgba(59, 130, 246, 0.08)',
    text: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.35)',
    badgeBg: 'rgba(59, 130, 246, 0.2)'
  },
  {
    primary: '#1e3a5f', // Navy Blue
    border: '#2e558a',
    bg: 'rgba(30, 58, 95, 0.35)',
    bgSubtle: 'rgba(30, 58, 95, 0.15)',
    text: '#93c5fd',
    glow: 'rgba(30, 58, 95, 0.5)',
    badgeBg: 'rgba(30, 58, 95, 0.4)'
  },
  {
    primary: '#10b981', // Emerald
    border: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    bgSubtle: 'rgba(16, 185, 129, 0.08)',
    text: '#34d399',
    glow: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'rgba(16, 185, 129, 0.2)'
  },
  {
    primary: '#f59e0b', // Amber / Gold
    border: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    bgSubtle: 'rgba(245, 158, 11, 0.08)',
    text: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.35)',
    badgeBg: 'rgba(245, 158, 11, 0.2)'
  },
  {
    primary: '#ec4899', // Pink / Rose
    border: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    bgSubtle: 'rgba(236, 72, 153, 0.08)',
    text: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.35)',
    badgeBg: 'rgba(236, 72, 153, 0.2)'
  },
  {
    primary: '#06b6d4', // Cyan
    border: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    bgSubtle: 'rgba(6, 182, 212, 0.08)',
    text: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.35)',
    badgeBg: 'rgba(6, 182, 212, 0.2)'
  },
  {
    primary: '#f97316', // Orange
    border: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    bgSubtle: 'rgba(249, 115, 22, 0.08)',
    text: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.35)',
    badgeBg: 'rgba(249, 115, 22, 0.2)'
  },
  {
    primary: '#2563eb', // Royal Blue
    border: '#3b82f6',
    bg: 'rgba(37, 99, 235, 0.15)',
    bgSubtle: 'rgba(37, 99, 235, 0.08)',
    text: '#60a5fa',
    glow: 'rgba(37, 99, 235, 0.35)',
    badgeBg: 'rgba(37, 99, 235, 0.2)'
  }
];

const UNASSIGNED_THEME: UserColorTheme = {
  primary: '#6b7280',
  border: 'rgba(255, 255, 255, 0.1)',
  bg: 'rgba(255, 255, 255, 0.03)',
  bgSubtle: 'transparent',
  text: 'var(--text-muted)',
  glow: 'transparent',
  badgeBg: 'rgba(255, 255, 255, 0.05)'
};

export function getUserTheme(userId?: number | null, userName?: string | null): UserColorTheme {
  if (!userId && !userName) {
    return UNASSIGNED_THEME;
  }

  // If we have an ID, use it for deterministic index
  if (typeof userId === 'number' && userId > 0) {
    return PALETTES[Math.abs(userId) % PALETTES.length];
  }

  // Fallback to name hash
  if (userName && userName.trim().length > 0) {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PALETTES[Math.abs(hash) % PALETTES.length];
  }

  return UNASSIGNED_THEME;
}
