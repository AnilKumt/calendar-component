'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  id: string;
  name: string;
  primary: string;      // #F6BD60
  light: string;        // #F7EDE2
  accent: string;       // #F5CAC3
  secondary: string;    // #84A59D
  highlight: string;    // #F28482
}

export const COLOR_THEMES: ThemePalette[] = [
  {
    id: 'warm-beige',
    name: 'Warm Beige',
    primary: '#F6BD60',
    light: '#F7EDE2',
    accent: '#F5CAC3',
    secondary: '#84A59D',
    highlight: '#F28482',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primary: '#0667F9',
    light: '#E8F0FE',
    accent: '#5F9FF6',
    secondary: '#1967D2',
    highlight: '#185ABC',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primary: '#34A853',
    light: '#E6F4EA',
    accent: '#81C995',
    secondary: '#1B8449',
    highlight: '#137333',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primary: '#F57C00',
    light: '#FFF3E0',
    accent: '#FFB74D',
    secondary: '#E65100',
    highlight: '#D84315',
  },
];

interface ThemeContextType {
  mode: ThemeMode;
  palette: ThemePalette;
  toggleMode: () => void;
  setPalette: (paletteId: string) => void;
  availablePalettes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [paletteId, setPaletteId] = useState<string>('warm-beige');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    setIsMounted(true);
    
    // Get saved theme mode
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    const savedPalette = localStorage.getItem('theme-palette') as string | null;
    
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
    
    if (savedPalette && COLOR_THEMES.some(t => t.id === savedPalette)) {
      setPaletteId(savedPalette);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isMounted) return;

    const palette = COLOR_THEMES.find(t => t.id === paletteId) || COLOR_THEMES[0];
    
    // Update CSS variables
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', palette.primary);
    root.style.setProperty('--theme-light', palette.light);
    root.style.setProperty('--theme-accent', palette.accent);
    root.style.setProperty('--theme-secondary', palette.secondary);
    root.style.setProperty('--theme-highlight', palette.highlight);
    
    // Apply dark mode class
    if (mode === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Use View Transition API if available for smooth theme change
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        // Transition already applied via CSS updates above
      });
    }
  }, [mode, paletteId, isMounted]);

  const toggleMode = useCallback(() => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  }, []);

  const setPaletteHandler = useCallback((id: string) => {
    if (COLOR_THEMES.some(t => t.id === id)) {
      setPaletteId(id);
      localStorage.setItem('theme-palette', id);
    }
  }, []);

  const palette = COLOR_THEMES.find(t => t.id === paletteId) || COLOR_THEMES[0];

  return (
    <ThemeContext.Provider value={{
      mode,
      palette,
      toggleMode,
      setPalette: setPaletteHandler,
      availablePalettes: COLOR_THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
