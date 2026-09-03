import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationHeader } from './components/NavigationHeader';
import { CardapioScreen } from './components/CardapioScreen';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { CartScreen } from './components/CartScreen';
import { IdentificationScreen } from './components/IdentificationScreen';
import { PixPaymentScreen } from './components/PixPaymentScreen';
import { OrderTrackingScreen } from './components/OrderTrackingScreen';
import { KDSScreen } from './components/KDSScreen';
import { AdminDashboard } from './components/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentScreen } = useApp();

  return (
    <main className="min-h-screen">
      {currentScreen === 'cardapio' && <CardapioScreen />}
      {currentScreen === 'cart' && <CartScreen />}
      {currentScreen === 'checkout' && <IdentificationScreen />}
      {currentScreen === 'pix' && <PixPaymentScreen />}
      {currentScreen === 'tracking' && <OrderTrackingScreen />}
      {currentScreen === 'kds' && <KDSScreen />}
      {currentScreen === 'admin' && <AdminDashboard />}

      {/* Global Product Detail & Pizza Customizer Sheet Modal */}
      <ProductDetailSheet />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-rose-500 selection:text-white">
        <NavigationHeader />
        <MainContent />
      </div>
    </AppProvider>
  );
};

export default App;
