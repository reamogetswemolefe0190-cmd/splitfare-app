export const COLORS = {
  background: '#0a0e17',      // Deep neutral Slate
  surface: '#151d30',         // Solid Slate-900 surface
  surfaceCard: '#151d30',     // Solid card backing (no fuzzy transparencies)
  primary: '#3b82f6',          // Royal Trust Blue (standard for finance)
  primaryDark: '#2563eb',      // Royal Blue Dark
  secondary: '#64748b',        // Muted slate gray
  accent: '#10b981',           // Emerald money green
  danger: '#ef4444',           // Red alert
  border: '#23304c',           // Clean, crisp border
  borderFocus: '#3b82f6',      // Focused Blue border
  text: '#ffffff',             // Crisp white text
  textSecondary: '#94a3b8',    // Slate-400 muted text
  textMuted: '#475569',        // Slate-600 deep muted text
  overlay: 'rgba(10, 14, 23, 0.85)'
};

export const FONTS = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700',         // Clean title bold
    color: COLORS.text,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  titleSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
};

export const SHADOWS = {
  glow: {
    // Glow is replaced by a flat soft shadow (no neon colors)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  }
};

export const LAYOUT = {
  padding: 16,
  borderRadiusLarge: 12,       // Tighter corners for professional look
  borderRadiusMedium: 8,       // Tighter corners
  borderRadiusSmall: 4,
  gap: 12,
};
