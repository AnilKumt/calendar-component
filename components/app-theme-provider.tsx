'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { DEFAULT_THEME_PALETTE, THEME_PALETTES, ThemePalette } from '@/lib/theme-palettes';

type PaletteContextValue = {
  palette: ThemePalette;
  palettes: ThemePalette[];
  setPaletteId: (paletteId: string) => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);
const PALETTE_STORAGE_KEY = 'calendar-theme-palette-v1';

function PaletteSyncProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState(DEFAULT_THEME_PALETTE.id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedPaletteId = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedPaletteId && THEME_PALETTES.some(palette => palette.id === savedPaletteId)) {
      setPaletteIdState(savedPaletteId);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const palette = THEME_PALETTES.find(item => item.id === paletteId) ?? DEFAULT_THEME_PALETTE;
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', palette.primary);
    root.style.setProperty('--theme-surface', palette.surface);
    root.style.setProperty('--theme-accent', palette.accent);
    root.style.setProperty('--theme-secondary', palette.secondary);
    root.style.setProperty('--theme-highlight', palette.highlight);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette.id);
  }, [mounted, paletteId]);

  const palette = useMemo(
    () => THEME_PALETTES.find(item => item.id === paletteId) ?? DEFAULT_THEME_PALETTE,
    [paletteId],
  );

  const value = useMemo<PaletteContextValue>(
    () => ({
      palette,
      palettes: THEME_PALETTES,
      setPaletteId: (nextPaletteId: string) => {
        if (THEME_PALETTES.some(item => item.id === nextPaletteId)) {
          setPaletteIdState(nextPaletteId);
        }
      },
    }),
    [palette],
  );

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <PaletteSyncProvider>{children}</PaletteSyncProvider>
    </NextThemesProvider>
  );
}

export function usePaletteTheme() {
  const context = useContext(PaletteContext);

  if (!context) {
    throw new Error('usePaletteTheme must be used within AppThemeProvider');
  }

  return context;
}

export function useAppTheme() {
  return useTheme();
}
