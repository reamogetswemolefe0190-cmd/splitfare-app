export const COLORS = {
  background: '#090e1a',      // Extra deep slate
  surface: '#151f32',         // Slate blue surface
  surfaceCard: 'rgba(21, 31, 50, 0.7)', // Semi-transparent card
  primary: '#6366f1',          // Indigo-500
  primaryDark: '#4f46e5',      // Indigo-600
  secondary: '#a855f7',        // Purple-500
  accent: '#10b981',           // Emerald success
  danger: '#f43f5e',           // Rose-500
  border: '#2a3b5c',           // Soft metallic border
  borderFocus: '#4f46e5',      // Indigo-600 border focus
  text: '#f8fafc',             // Slate-50 white
  textSecondary: '#94a3b8',    // Slate-400 muted text
  textMuted: '#64748b',        // Slate-500 deep muted text
  overlay: 'rgba(9, 14, 26, 0.8)' // Background overlay
};

export const FONTS = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  bodyLarge: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  }
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  }
};

export const LAYOUT = {
  padding: 20,
  borderRadiusLarge: 20,
  borderRadiusMedium: 14,
  borderRadiusSmall: 8,
  gap: 12,
};
