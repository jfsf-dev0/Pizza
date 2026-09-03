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
import { AdminGestaoPizzaria } from './components/AdminGestaoPizzaria';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AdminAuthModal } from './components/AdminAuthModal';

const MainContent: React.FC = () => {
  const { 
    activePortal, 
    currentScreen, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    adminSession 
  } = useApp();

  if (activePortal === 'admin') {
    if (!adminSession.isAuthenticated) {
      return <AdminAuthModal />;
    }

    return (
      <main className="min-h-screen">
        {currentScreen === 'kds' && <KDSScreen />}
        {currentScreen === 'admin' && <AdminDashboard />}
        {currentScreen === 'admin_gestao' && <AdminGestaoPizzaria />}
      </main>
    );
  }

  // Customer Flow
  return (
    <main className="min-h-screen">
      {currentScreen === 'cardapio' && <CardapioScreen />}
      {currentScreen === 'cart' && <CartScreen />}
      {currentScreen === 'checkout' && <IdentificationScreen />}
      {currentScreen === 'pix' && <PixPaymentScreen />}
      {currentScreen === 'tracking' && <OrderTrackingScreen />}

      {/* Global Product Detail & Pizza Customizer Sheet Modal */}
      <ProductDetailSheet />

      {/* Customer OAuth Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
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
