export type UserRole = 'customer' | 'attendant' | 'deliveryman' | 'admin';

export type OrderStatus = 
  | 'pending'           // Pedido Recebido
  | 'confirmed'         // Confirmado pela Cozinha
  | 'preparing'         // Em Preparação
  | 'out_for_delivery'  // Saiu para Entrega
  | 'delivered'         // Entregue
  | 'cancelled';        // Cancelado

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface PizzaSize {
  id: string;
  name: string;
  slug: string;
  slices: number;
  max_flavors: number;
  display_order: number;
}

export interface PizzaCrust {
  id: string;
  name: string;
  price: number;
}

export interface PizzaFlavor {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  ingredients: string[];
  prices: Record<string, number>; // sizeId -> price
  is_active: boolean;
  tags?: string[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_active: boolean;
  is_popular?: boolean;
  tags?: string[];
}

export interface CartItem {
  id: string;
  type: 'pizza' | 'product';
  product?: Product;
  pizzaSize?: PizzaSize;
  pizzaCrust?: PizzaCrust;
  pizzaFlavors?: PizzaFlavor[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  avatarUrl?: string;
  provider?: 'google' | 'facebook' | 'guest';
}

export interface UserSession {
  isAuthenticated: boolean;
  customer?: CustomerInfo;
  provider?: 'google' | 'facebook' | 'guest';
}

export interface AdminSession {
  isAuthenticated: boolean;
  username?: string;
  role?: UserRole;
}

export interface Order {
  id: string;
  orderNumber: number;
  customer: CustomerInfo;
  orderType: 'delivery' | 'takeaway';
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress?: DeliveryAddress;
  items: CartItem[];
  notes?: string;
  createdAt: string;
  estimatedMinutes: number;
  driver?: {
    name: string;
    vehicle: string;
    rating: number;
    phone: string;
  };
}

export interface StoreSettings {
  isOpen: boolean;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  minOrderValue: number;
  storeAddress: string;
  storePhone: string;
  acceptsPix: boolean;
  acceptsCard: boolean;
}
