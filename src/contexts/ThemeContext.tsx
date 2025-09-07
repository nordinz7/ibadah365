import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme } from '../types/preferences';
import { preferencesManager } from '../utils/preferencesManager';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(preferencesManager.getTheme());
  const [isDark, setIsDark] = useState(preferencesManager.getPreferences().theme === 'dark');

  useEffect(() => {
    const unsubscribe = preferencesManager.addPreferencesListener((preferences) => {
      setTheme(preferencesManager.getTheme());
      setIsDark(preferences.theme === 'dark');
    });

    return unsubscribe;
  }, []);

  const toggleTheme = async () => {
    await preferencesManager.toggleTheme();
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};