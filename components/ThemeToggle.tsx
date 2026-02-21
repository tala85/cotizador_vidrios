"use client";

import React from 'react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-app-muted p-1 rounded-full border border-app shadow-sm">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          theme === 'light'
            ? 'bg-app-card text-app-foreground shadow-sm'
            : 'text-app-muted-fg hover:text-app-foreground'
        }`}
      >
        Claro
      </button>
      <button
        onClick={() => setTheme('mid')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          theme === 'mid'
            ? 'bg-app-card text-app-foreground shadow-sm'
            : 'text-app-muted-fg hover:text-app-foreground'
        }`}
      >
        Medio
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          theme === 'dark'
            ? 'bg-app-card text-app-foreground shadow-sm'
            : 'text-app-muted-fg hover:text-app-foreground'
        }`}
      >
        Oscuro
      </button>
    </div>
  );
}
