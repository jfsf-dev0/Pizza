import React from 'react';
import { useApp, ScreenView } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  LayoutDashboard, 
  Bike, 
  Store,
  Sparkles,
  User,
  ShieldCheck,
  Settings,
  LogOut
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const { 
    activePortal,
    setActivePortal,
    currentScreen, 
    setCurrentScreen, 
    cart, 
    storeSettings, 
    orderType, 
    setOrderType,
    userSession,
    setIsAuthModalOpen,
    logoutCustomer,
    adminSession,
    logoutAdmin
  } = useApp();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Customer Navigation Items
  const customerNavItems: { id: ScreenView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'cardapio', label: 'Cardápio', icon: UtensilsCrossed },
    { id: 'cart', label: 'Carrinho', icon: ShoppingBag, badge: totalCartCount },
    { id: 'tracking', label: 'Meus Pedidos', icon: Clock },
  ];

  // Admin Navigation Items
  const adminNavItems: { id: ScreenView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'kds', label: 'Cozinha KDS', icon: ChefHat },
    { id: 'admin', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'admin_gestao', label: 'Gestão da Pizzaria', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-lg border-b border-zinc-800">
      {/* Top Banner & Portal Switcher Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-zinc-900 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 text-white font-medium">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${storeSettings.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${storeSettings.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-[11px]">
            {storeSettings.isOpen ? 'Restaurante Aberto • Pedidos em Tempo Real' : 'Restaurante Fechado'}
          </span>
        </div>

        {/* Portal Switcher (Área do Cliente vs Admin Pizzaria) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 p-0.5 rounded-full text-[11px]">
            <button
              onClick={() => {
                setActivePortal('customer');
                setCurrentScreen('cardapio');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold transition ${
                activePortal === 'customer'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Área do Cliente
            </button>
            <button
              onClick={() => {
                setActivePortal('admin');
                setCurrentScreen('kds');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold transition ${
                activePortal === 'admin'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              `adminpizzaria`
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => {
            if (activePortal === 'customer') setCurrentScreen('cardapio');
            else setCurrentScreen('kds');
          }} 
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition">
            🍕
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight flex items-center gap-1.5">
              Bella Pizza
              {activePortal === 'admin' && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                  Admin
                </span>
              )}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              {activePortal === 'customer' ? 'Cardápio & Delivery PWA' : 'Painel de Gestão e Cozinha'}
            </p>
          </div>
        </button>

        {/* Desktop Screen Nav Pills */}
        <nav className="hidden md:flex items-center bg-zinc-800/80 p-1.5 rounded-xl border border-zinc-700/50">
          {(activePortal === 'customer' ? customerNavItems : adminNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white text-rose-600 font-extrabold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Auth Buttons / Status */}
        <div className="flex items-center gap-2">
          {activePortal === 'customer' ? (
            userSession.isAuthenticated ? (
              <div className="flex items-center gap-2 bg-zinc-800 p-1.5 rounded-xl border border-zinc-700">
                <img
                  src={userSession.customer?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold text-zinc-200">
                  {userSession.customer?.name.split(' ')[0]}
                </span>
                <button
                  onClick={logoutCustomer}
                  title="Sair da Conta"
                  className="text-zinc-400 hover:text-rose-400 p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Entrar (Google/FB)</span>
              </button>
            )
          ) : adminSession.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
                Logged Admin
              </span>
              <button
                onClick={logoutAdmin}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-rose-400 font-bold">Acesso Restrito Staff</span>
          )}
        </div>
      </div>
    </header>
  );
};
