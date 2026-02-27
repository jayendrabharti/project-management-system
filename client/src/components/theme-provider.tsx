import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ColorPreset = 'violet' | 'blue' | 'green' | 'orange' | 'rose' | 'zinc';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultPreset?: ColorPreset;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorPreset: ColorPreset;
  setColorPreset: (preset: ColorPreset) => void;
  resolvedTheme: 'dark' | 'light';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorPreset: 'violet',
  setColorPreset: () => null,
  resolvedTheme: 'dark',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const PRESET_CLASSES: ColorPreset[] = ['violet', 'blue', 'green', 'orange', 'rose', 'zinc'];

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultPreset = 'violet',
  storageKey = 'projecthub-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [colorPreset, setColorPreset] = useState<ColorPreset>(
    () => (localStorage.getItem(`${storageKey}-preset`) as ColorPreset) || defaultPreset
  );
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;

    // Handle dark/light mode
    root.classList.remove('light', 'dark');

    let resolved: 'dark' | 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);

    // Handle color preset
    PRESET_CLASSES.forEach((p) => root.classList.remove(`theme-${p}`));
    if (colorPreset !== 'violet') {
      root.classList.add(`theme-${colorPreset}`);
    }
  }, [theme, colorPreset]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      const resolved = e.matches ? 'dark' : 'light';
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const value: ThemeProviderState = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    colorPreset,
    setColorPreset: (preset: ColorPreset) => {
      localStorage.setItem(`${storageKey}-preset`, preset);
      setColorPreset(preset);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export type { Theme, ColorPreset };
