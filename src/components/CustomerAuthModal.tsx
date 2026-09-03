import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, CheckCircle2, User, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginCustomer, userSession } = useApp();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = (provider: 'google' | 'facebook') => {
    setLoadingProvider(provider);
    setTimeout(() => {
      if (provider === 'google') {
        loginCustomer({
          name: 'João Silva (Google)',
          email: 'joao.silva@gmail.com',
          phone: '(11) 98765-4321',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          provider: 'google',
        });
      } else {
        loginCustomer({
          name: 'João Silva (Facebook)',
          email: 'joao.facebook@social.com',
          phone: '(11) 97777-6666',
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          provider: 'facebook',
        });
      }
      setLoadingProvider(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner">
            🍕
          </div>
          <h3 className="text-xl font-black">Entrar ou Criar Conta</h3>
          <p className="text-xs text-rose-100 mt-1 font-medium">
            Acompanhe seus pedidos em tempo real e salve seus endereços
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {userSession.isAuthenticated ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-emerald-500 shadow">
                <img
                  src={userSession.customer?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-zinc-900">{userSession.customer?.name}</h4>
                <p className="text-xs text-zinc-500">{userSession.customer?.email}</p>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado via {userSession.customer?.provider?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-zinc-900 text-white font-bold py-3 rounded-2xl text-xs hover:bg-zinc-800 transition mt-2"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth Button */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loadingProvider !== null}
                className="w-full bg-white hover:bg-zinc-50 border-2 border-zinc-200 text-zinc-800 font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-xs transition flex items-center justify-center gap-3 relative group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>
                  {loadingProvider === 'google' ? 'Conectando ao Google...' : 'Continuar com Google'}
                </span>
              </button>

              {/* Facebook OAuth Button */}
              <button
                onClick={() => handleOAuthLogin('facebook')}
                disabled={loadingProvider !== null}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>
                  {loadingProvider === 'facebook' ? 'Conectando ao Facebook...' : 'Continuar com Facebook'}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-zinc-400 uppercase">ou</span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>

              {/* Quick Guest Continuator */}
              <button
                onClick={() => {
                  loginCustomer({
                    name: 'Cliente Visitante',
                    phone: '(11) 99999-0000',
                    provider: 'guest',
                  });
                  onClose();
                }}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3 px-4 rounded-2xl text-xs transition"
              >
                Continuar sem Login (Convidado)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
