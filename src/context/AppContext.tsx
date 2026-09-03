import React, { createContext, useContext, useState } from 'react';
import { 
  Category, 
  PizzaSize, 
  PizzaCrust, 
  PizzaFlavor, 
  Product, 
  CartItem, 
  Order, 
  DeliveryAddress, 
  CustomerInfo, 
  StoreSettings 
} from '../types';
import { 
  mockCategories, 
  mockPizzaSizes, 
  mockPizzaCrusts, 
  mockPizzaFlavors, 
  mockProducts, 
  mockOrders, 
  mockStoreSettings 
} from '../data/mockData';

export type ScreenView = 
  | 'cardapio' 
  | 'product_detail' 
  | 'cart' 
  | 'checkout' 
  | 'pix' 
  | 'tracking' 
  | 'kds' 
  | 'admin';

interface AppContextType {
  currentScreen: ScreenView;
  setCurrentScreen: (screen: ScreenView) => void;

  // Catalog Data
  categories: Category[];
  pizzaSizes: PizzaSize[];
  pizzaCrusts: PizzaCrust[];
  pizzaFlavors: PizzaFlavor[];
  products: Product[];

  // Pizza Customization Builder State
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (product: Product | null) => void;
  isPizzaBuilderOpen: boolean;
  setIsPizzaBuilderOpen: (open: boolean) => void;

  // Cart State
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;

  // Cart Financials
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;

  // Order & Checkout
  customer: CustomerInfo;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<DeliveryAddress>>;
  orderType: 'delivery' | 'takeaway';
  setOrderType: (type: 'delivery' | 'takeaway') => void;

  // Active Order & List
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  createOrderFromCart: () => Order;

  // Store Config
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('cardapio');
  
  // Data
  const [categories] = useState<Category[]>(mockCategories);
  const [pizzaSizes] = useState<PizzaSize[]>(mockPizzaSizes);
  const [pizzaCrusts] = useState<PizzaCrust[]>(mockPizzaCrusts);
  const [pizzaFlavors] = useState<PizzaFlavor[]>(mockPizzaFlavors);
  const [products] = useState<Product[]>(mockProducts);

  // Builders
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isPizzaBuilderOpen, setIsPizzaBuilderOpen] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Customer & Address
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'João Silva',
    phone: '(11) 99887-6655',
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: 'Rua Augusta',
    number: '1200',
    complement: 'Apto 45',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01304-001',
    referencePoint: 'Próximo ao metrô',
  });

  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');

  // Orders
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeOrder, setActiveOrder] = useState<Order | null>(mockOrders[0]);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(mockStoreSettings);

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const deliveryFee = orderType === 'delivery' ? storeSettings.deliveryFee : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Cart Handlers
  const addToCart = (newItem: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = 'cart-' + Math.random().toString(36).substring(2, 9);
    const subtotal = newItem.unitPrice * newItem.quantity;
    setCart((prev) => [...prev, { ...newItem, id, subtotal }]);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'PIZZA10' || clean === 'PRIMEIRACOMPRA') {
      setCouponCode(clean);
      setCouponDiscount(10.00);
      return true;
    }
    return false;
  };

  // Orders
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const createOrderFromCart = (): Order => {
    const newOrder: Order = {
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
      orderNumber: orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1004,
      customer,
      orderType,
      status: 'pending',
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      subtotal,
      deliveryFee,
      discount: couponDiscount,
      totalAmount,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      items: [...cart],
      createdAt: new Date().toISOString(),
      estimatedMinutes: storeSettings.deliveryTimeMinutes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        categories,
        pizzaSizes,
        pizzaCrusts,
        pizzaFlavors,
        products,
        selectedProductForDetail,
        setSelectedProductForDetail,
        isPizzaBuilderOpen,
        setIsPizzaBuilderOpen,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        couponCode,
        couponDiscount,
        applyCoupon,
        subtotal,
        deliveryFee,
        totalAmount,
        customer,
        setCustomer,
        deliveryAddress,
        setDeliveryAddress,
        orderType,
        setOrderType,
        activeOrder,
        setActiveOrder,
        orders,
        updateOrderStatus,
        createOrderFromCart,
        storeSettings,
        setStoreSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
