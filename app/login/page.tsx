"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Aquí iría la lógica de Supabase:
    // const { error } = await supabase.auth.signInWithPassword({ email, password });

    setTimeout(() => {
      toast.info("Funcionalidad de inicio de sesión en desarrollo. Por favor, configura las variables de Supabase.");
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-app-bg p-4">
      <div className="max-w-md w-full bg-app-card p-8 rounded-xl shadow-lg border border-app">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-app-foreground uppercase tracking-tight">Acceso</h1>
          <p className="text-app-muted mt-2 font-medium">Gestiona tus presupuestos desde cualquier lugar</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-app-muted uppercase">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-app bg-app-muted text-app-foreground rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-app-muted uppercase">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-app bg-app-muted text-app-foreground rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-app-muted">
            ¿No tienes una cuenta? {' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-app text-center">
          <Link href="/" className="text-xs text-app-muted hover:text-app-foreground transition-colors">
            ← Volver al cotizador
          </Link>
        </div>
      </div>
    </main>
  );
}
