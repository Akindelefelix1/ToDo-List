import {DarkTheme, DefaultTheme, type Theme as NavigationTheme} from '@react-navigation/native';

import {palette} from './tokens';

export type AppTheme = {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textMuted: string;
    primary: string;
    primarySoft: string;
    border: string;
    danger: string;
    success: string;
    accent: string;
  };
};

export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    background: palette.canvas,
    surface: palette.white,
    surfaceElevated: palette.white,
    text: palette.ink,
    textMuted: palette.muted,
    primary: palette.primary,
    primarySoft: palette.primarySoft,
    border: palette.border,
    danger: palette.danger,
    success: palette.success,
    accent: palette.accent,
  },
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    background: palette.night,
    surface: palette.nightCard,
    surfaceElevated: '#202A3D',
    text: '#F4F6FB',
    textMuted: '#A2ACBE',
    primary: '#8586FF',
    primarySoft: '#2D2E5E',
    border: palette.borderDark,
    danger: '#FF7890',
    success: '#49CE92',
    accent: '#FFC271',
  },
};

export function toNavigationTheme(theme: AppTheme): NavigationTheme {
  const base = theme.dark ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}
