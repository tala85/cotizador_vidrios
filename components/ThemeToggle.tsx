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
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Claro
      </button>
      <button
        onClick={() => setTheme('mid')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          theme === 'mid'
            ? 'bg-slate-300 text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Medio
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          theme === 'dark'
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Oscuro
      </button>
    </div>
  );
}
