import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { loginAdmin, adminSession } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (adminSession.isAuthenticated) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'admin' || password === '123456') {
      loginAdmin('admin');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-zinc-200 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-lg">
          <ShieldCheck className="w-8 h-8 text-rose-500" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-zinc-900">Acesso Restrito - Admin</h2>
          <p className="text-xs text-zinc-500 font-medium">
            Digite a senha de administrador da pizzaria para acessar o Painel de Gestão e Cozinha.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide block mb-1.5">
              Senha de Acesso (`admin123`)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Senha incorreta. Use `admin123` para acessar a demonstração.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
          >
            <span>Entrar na Gestão da Pizzaria</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-400">
          🔑 Senha padrão de teste: <strong className="text-zinc-700 underline">admin123</strong>
        </div>
      </div>
    </div>
  );
};
