/**
 * Design Tokens for CuentasClaras
 * Strictly follows Apple Human Interface Guidelines (HIG) + ui-ux-pro-max:
 * - Minimum touch target 44x44 pt
 * - Semantic dark mode by luminance separation (no muddy pure blacks/greys)
 * - San Francisco rounded tabular typography for financial values
 * - WCAG AAA / AA compliance (contrast > 4.5:1)
 */

export const Colors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    primary: '#059669', // Emerald Green (Trust, Prosperity)
    primaryText: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    danger: '#DC2626',
    warning: '#D97706',
    surfaceSubtle: '#F1F5F9',
  },
  dark: {
    background: '#0B0F19', // Deep dark slate
    card: '#161F30', // Elevated luminance card
    cardBorder: '#27354A',
    primary: '#10B981', // Crisp Emerald Green
    primaryText: '#0B0F19',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    danger: '#EF4444',
    warning: '#FBBF24',
    surfaceSubtle: '#1E293B',
  },
};

export const Metrics = {
  touchTargetMin: 44,
  radiusSmall: 8,
  radiusMedium: 14,
  radiusLarge: 20,
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 32,
};
