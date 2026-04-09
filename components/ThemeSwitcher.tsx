'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';

export function ThemeSwitcher() {
  const { mode, palette, toggleMode, setPalette, availablePalettes } = useTheme();
  const [showPalettes, setShowPalettes] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Palette Selector */}
      <div className="relative">
        <button
          onClick={() => setShowPalettes(!showPalettes)}
          className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative"
          style={{ backgroundColor: palette.primary }}
          title="Color Palettes"
        >
          <span className="text-white text-lg font-bold">🎨</span>
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full border border-gray-300"></div>
        </button>

        {/* Palette Dropdown */}
        {showPalettes && (
          <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48">
            <div className="text-xs font-semibold text-gray-600 mb-2 px-2">Color Palettes</div>
            <div className="space-y-2">
              {availablePalettes.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPalette(p.id);
                    setShowPalettes(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                    palette.id === p.id 
                      ? 'bg-gray-100 border border-gray-400' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: p.primary }}
                      title={p.primary}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: p.secondary }}
                      title={p.secondary}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: p.highlight }}
                      title={p.highlight}
                    />
                  </div>
                  <span className="text-xs text-gray-700 flex-1 text-left">{p.name}</span>
                  {palette.id === p.id && <span className="text-xs font-bold text-gray-600">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Light/Dark Mode Toggle */}
      <button
        onClick={toggleMode}
        className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:bg-gray-100"
        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        style={{
          backgroundColor: mode === 'light' ? '#fff9e6' : '#1a1a1a',
        }}
      >
        <span className="text-lg">{mode === 'light' ? '🌙' : '☀️'}</span>
      </button>
    </div>
  );
}
