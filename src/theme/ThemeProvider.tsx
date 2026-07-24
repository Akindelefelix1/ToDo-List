import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';

import {darkTheme, lightTheme, type AppTheme} from './theme';

const THEME_KEY = '@todo-list/theme';
type ThemePreference = 'light' | 'dark';

type ThemeContextValue = {
  theme: AppTheme;
  preference: ThemePreference;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: React.PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(value => {
        if (value === 'light' || value === 'dark') {
          setPreference(value);
        }
      })
      .catch(() => undefined);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_KEY, next).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme: preference === 'dark' ? darkTheme : lightTheme,
      preference,
      toggleTheme,
    }),
    [preference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
