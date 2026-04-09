'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppTheme, usePaletteTheme } from '@/components/app-theme-provider';

const THEME_TRANSITION_STYLE_ID = 'theme-transition-styles';

const createCircleRevealAnimation = (position = 'top-right') => {
  const getClipPathPosition = (pos: string) => {
    switch (pos) {
      case 'top-left':
        return '0% 0%';
      case 'top-right':
        return '100% 0%';
      case 'bottom-left':
        return '0% 100%';
      case 'bottom-right':
        return '100% 100%';
      default:
        return '50% 50%';
    }
  };

  const clipPosition = getClipPathPosition(position);

  return `
    :root {
      --expo-out: cubic-bezier(0.16, 1, 0.3, 1);
    }

    ::view-transition-group(root) {
      animation-duration: 0.7s;
      animation-timing-function: var(--expo-out);
    }

    ::view-transition-new(root) {
      animation-name: reveal-light-${position};
    }

    ::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }

    .dark::view-transition-new(root) {
      animation-name: reveal-dark-${position};
    }

    @keyframes reveal-dark-${position} {
      from {
        clip-path: circle(0% at ${clipPosition});
      }
      to {
        clip-path: circle(150% at ${clipPosition});
      }
    }

    @keyframes reveal-light-${position} {
      from {
        clip-path: circle(0% at ${clipPosition});
      }
      to {
        clip-path: circle(150% at ${clipPosition});
      }
    }
  `;
};

function ThemePaletteIcon() {
  return (
    <svg viewBox="0 0 512 512" width="20" height="20" aria-hidden="true" fill="currentColor">
      <g>
        <path d="M475.691,0.021c-14.656,0-27.776,8.725-33.451,22.251l-32.64,77.973c-9.728-9.152-22.421-14.933-36.267-14.933h-320C23.936,85.312,0,109.248,0,138.645v320c0,29.397,23.936,53.333,53.333,53.333h320c29.397,0,53.333-23.936,53.333-53.333V225.152l81.92-172.821c2.24-4.757,3.413-10.048,3.413-16.043C512,16.299,495.701,0.021,475.691,0.021z M405.333,458.645c0,17.643-14.357,32-32,32h-320c-17.643,0-32-14.357-32-32v-320c0-17.643,14.357-32,32-32h320c11.243,0,21.312,6.101,27.072,15.573l-37.739,90.197v-52.437c0-5.888-4.779-10.667-10.667-10.667H74.667c-5.888,0-10.667,4.779-10.667,10.667v85.333c0,5.888,4.779,10.667,10.667,10.667h269.76l-8.939,21.333h-90.155c-5.888,0-10.667,4.779-10.667,10.667v128c0,0.277,0.128,0.512,0.149,0.789c-8.768,7.787-14.144,10.389-14.528,10.539c-3.371,1.259-5.888,4.096-6.699,7.616c-0.811,3.584,0.256,7.339,2.859,9.941c15.445,15.445,36.757,21.333,57.6,21.333c26.645,0,52.48-9.643,64.128-21.333c16.768-16.768,29.056-50.005,19.776-74.773l47.381-99.925V458.645z M270.635,397.525c2.944-9.685,5.739-18.859,14.229-27.349c15.083-15.083,33.835-15.083,48.917,0c13.504,13.504,3.2,45.717-10.667,59.584c-11.563,11.541-52.672,22.677-80.256,8.256c3.669-2.859,7.893-6.549,12.672-11.328C264.448,417.749,267.605,407.467,270.635,397.525z M256,375.339v-76.672h70.571l-16.363,39.083c-14.251-0.256-28.565,5.483-40.448,17.387C263.125,361.771,259.008,368.661,256,375.339z M331.264,342.741l28.715-68.629l16.128,7.915l-32.555,68.651C339.605,347.477,335.531,344.747,331.264,342.741z M341.333,170.645v64h-256v-64H341.333z M489.28,43.243l-104.064,219.52l-17.003-8.341l54.08-129.237l39.616-94.677c2.325-5.568,7.744-9.152,13.803-9.152c8.235,0,14.933,6.699,14.933,15.659C490.645,39.147,490.176,41.344,489.28,43.243z" />
      </g>
      <g>
        <path d="M181.333,277.312H74.667c-5.888,0-10.667,4.779-10.667,10.667v149.333c0,5.888,4.779,10.667,10.667,10.667h106.667c5.888,0,10.667-4.779,10.667-10.667V287.979C192,282.091,187.221,277.312,181.333,277.312z M170.667,426.645H85.333v-128h85.333V426.645z" />
      </g>
    </svg>
  );
}

export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    const animationCSS = createCircleRevealAnimation('top-right');

    let styleElement = document.getElementById(THEME_TRANSITION_STYLE_ID) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = THEME_TRANSITION_STYLE_ID;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = animationCSS;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(nextTheme);
      });
      return;
    }

    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className={`transition-all duration-300 active:scale-95 outline-none ${
        isDark ? 'text-white' : 'text-black'
      } ${className}`.trim()}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" strokeLinecap="round" viewBox="0 0 32 32" width="48" height="48">
        <clipPath id="skiper-btn-2">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#skiper-btn-2)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}

export function ThemeControls() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { palette, palettes, setPaletteId } = usePaletteTheme();
  const { resolvedTheme } = useAppTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          style={{
            borderColor: 'var(--panel-border)',
            backgroundColor: 'var(--panel-bg)',
            color: isDarkTheme ? '#ffffff' : '#000000',
          }}
          onClick={() => setIsPaletteOpen(value => !value)}
          aria-label="Open color palette picker"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
            <ThemePaletteIcon />
          </span>
        </button>

        {isPaletteOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-2xl border p-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
            style={{
              borderColor: 'var(--panel-border)',
              backgroundColor: 'var(--panel-bg)',
            }}
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text-secondary)' }}>
              Color Themes
            </div>
            <div className="space-y-2">
              {palettes.map(item => {
                const isActive = item.id === palette.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPaletteId(item.id);
                      setIsPaletteOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors"
                    style={{
                      borderColor: isActive ? 'var(--text-primary)' : 'transparent',
                      backgroundColor: isActive ? 'var(--surface-muted)' : 'transparent',
                    }}
                  >
                    <div className="flex gap-1.5">
                      {[item.primary, item.surface, item.accent, item.secondary, item.highlight].map(color => (
                        <span key={color} className="h-4 w-4 rounded-full border border-white/80 shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    {isActive ? <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <ThemeToggleButton />
    </div>
  );
}
