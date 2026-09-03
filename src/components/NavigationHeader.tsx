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
  Sparkles
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const { 
    currentScreen, 
    setCurrentScreen, 
    cart, 
    storeSettings, 
    orderType, 
    setOrderType,
    activeOrder
  } = useApp();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems: { id: ScreenView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'cardapio', label: 'Cardápio', icon: UtensilsCrossed },
    { id: 'cart', label: 'Carrinho', icon: ShoppingBag, badge: totalCartCount },
    { id: 'tracking', label: 'Status', icon: Clock },
    { id: 'kds', label: 'Cozinha', icon: ChefHat },
    { id: 'admin', label: 'Admin', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-900 text-white shadow-lg border-b border-zinc-800">
      {/* Top Banner Status */}
      <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-xs py-1.5 px-4 flex items-center justify-between text-white font-medium">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${storeSettings.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${storeSettings.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span>{storeSettings.isOpen ? 'Restaurante Aberto • Pedidos em Tempo Real' : 'Restaurante Fechado'}</span>
        </div>

        {/* Order Mode Toggle Pills */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-full text-[11px]">
          <button
            onClick={() => setOrderType('delivery')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition ${
              orderType === 'delivery' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Bike className="w-3 h-3" />
            Entrega ({storeSettings.deliveryTimeMinutes} min)
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition ${
              orderType === 'takeaway' ? 'bg-white text-zinc-900 font-bold shadow-sm' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Store className="w-3 h-3" />
            Retirada (15 min)
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => setCurrentScreen('cardapio')} 
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition">
            🍕
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight flex items-center gap-1.5">
              Bella Pizza
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Forno a Lenha & Delivery</p>
          </div>
        </button>

        {/* Desktop Screen Nav Pills */}
        <nav className="hidden md:flex items-center bg-zinc-800/80 p-1.5 rounded-xl border border-zinc-700/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || (item.id === 'tracking' && (currentScreen === 'pix' || currentScreen === 'checkout'));
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

        {/* Quick Cart Button Mobile */}
        <button
          onClick={() => setCurrentScreen('cart')}
          className="md:hidden relative bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-xl flex items-center justify-center transition shadow-md"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-zinc-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive ? 'text-rose-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0 right-2 px-1.5 py-0.2 text-[9px] bg-rose-600 text-white font-extrabold rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
