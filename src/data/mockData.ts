import { Category, PizzaSize, PizzaCrust, PizzaFlavor, Product, Order, StoreSettings } from '../types';

export const mockCategories: Category[] = [
  { id: 'cat-salgadas', name: 'Pizzas Salgadas', slug: 'pizzas-salgadas', display_order: 1, is_active: true },
  { id: 'cat-doces', name: 'Pizzas Doces', slug: 'pizzas-doces', display_order: 2, is_active: true },
  { id: 'cat-bebidas', name: 'Bebidas Geladas', slug: 'bebidas', display_order: 3, is_active: true },
  { id: 'cat-sobremesas', name: 'Sobremesas', slug: 'sobremesas', display_order: 4, is_active: true },
];

export const mockPizzaSizes: PizzaSize[] = [
  { id: 'size-broto', name: 'Broto (4 Fatias)', slug: 'broto', slices: 4, max_flavors: 2, display_order: 1 },
  { id: 'size-media', name: 'Média (6 Fatias)', slug: 'media', slices: 6, max_flavors: 2, display_order: 2 },
  { id: 'size-grande', name: 'Grande (8 Fatias)', slug: 'grande', slices: 8, max_flavors: 3, display_order: 3 },
  { id: 'size-gigante', name: 'Gigante (12 Fatias)', slug: 'gigante', slices: 12, max_flavors: 3, display_order: 4 },
];

export const mockPizzaCrusts: PizzaCrust[] = [
  { id: 'crust-none', name: 'Sem Borda Recheada', price: 0.00 },
  { id: 'crust-catupiry', name: 'Borda Catupiry Original', price: 8.50 },
  { id: 'crust-cheddar', name: 'Borda Cheddar Cremoso', price: 8.50 },
  { id: 'crust-chocolate', name: 'Borda Chocolate ao Leite', price: 10.00 },
];

export const mockPizzaFlavors: PizzaFlavor[] = [
  {
    id: 'flavor-calabresa',
    category_id: 'cat-salgadas',
    name: 'Calabresa Tradicional',
    description: 'Calabresa artesanal fatiada, rodelas de cebola roxa e azeitonas pretas azapa sobre mussarela derretida.',
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    ingredients: ['molho de tomate caseiro', 'mussarela', 'calabresa fatiada', 'cebola roxa', 'orégano fresco'],
    prices: {
      'size-broto': 35.00,
      'size-media': 45.00,
      'size-grande': 55.00,
      'size-gigante': 70.00,
    },
    is_active: true,
    tags: ['Mais Pedida', 'Tradição'],
  },
  {
    id: 'flavor-4queijos',
    category_id: 'cat-salgadas',
    name: 'Quatro Queijos Premium',
    description: 'Combinação refinada de Mussarela especial, Provolone defumado, Parmesão curado e Catupiry legítimo.',
    image_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80',
    ingredients: ['molho de tomate', 'mussarela', 'provolone', 'parmesão', 'catupiry'],
    prices: {
      'size-broto': 40.00,
      'size-media': 52.00,
      'size-grande': 65.00,
      'size-gigante': 82.00,
    },
    is_active: true,
    tags: ['Especial', 'Vegetariana'],
  },
  {
    id: 'flavor-camarao',
    category_id: 'cat-salgadas',
    name: 'Camarão ao Catupiry',
    description: 'Camarões selecionados salteados no alho e azeite extra virgem com generosa cobertura de Catupiry.',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    ingredients: ['molho de tomate', 'mussarela', 'camarão premium', 'catupiry', 'alho crocante'],
    prices: {
      'size-broto': 50.00,
      'size-media': 68.00,
      'size-grande': 85.00,
      'size-gigante': 105.00,
    },
    is_active: true,
    tags: ['Gourmet', 'Chef Spec'],
  },
  {
    id: 'flavor-frango-catupiry',
    category_id: 'cat-salgadas',
    name: 'Frango com Catupiry',
    description: 'Peito de frango desfiado temperado com ervas finas e coberto com legítimo requeijão Catupiry.',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    ingredients: ['molho de tomate', 'mussarela', 'frango desfiado', 'catupiry', 'milho verde'],
    prices: {
      'size-broto': 38.00,
      'size-media': 48.00,
      'size-grande': 58.00,
      'size-gigante': 74.00,
    },
    is_active: true,
    tags: ['Sucesso de Vendas'],
  },
  {
    id: 'flavor-nutella',
    category_id: 'cat-doces',
    name: 'Nutella com Morango',
    description: 'Generosa camada de Nutella pura coberta com morangos frescos fatiados e leite condensado.',
    image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&auto=format&fit=crop&q=80',
    ingredients: ['base de massa doce', 'nutella pura', 'morangos frescos', 'granulado gourmet'],
    prices: {
      'size-broto': 38.00,
      'size-media': 48.00,
      'size-grande': 60.00,
      'size-gigante': 78.00,
    },
    is_active: true,
    tags: ['Doce Destaque'],
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-coca-2l',
    category_id: 'cat-bebidas',
    name: 'Coca-Cola Zero 2 Litros',
    description: 'Garrafa 2L trincando de gelada.',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    price: 14.00,
    is_active: true,
    is_popular: true,
    tags: ['Gelada'],
  },
  {
    id: 'prod-guarana-2l',
    category_id: 'cat-bebidas',
    name: 'Guaraná Antarctica 2 Litros',
    description: 'O sabor original do Brasil 2L.',
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    price: 12.00,
    is_active: true,
  },
  {
    id: 'prod-heineken',
    category_id: 'cat-bebidas',
    name: 'Heineken Long Neck 330ml',
    description: 'Cerveja Pilsen premium gelada.',
    image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&auto=format&fit=crop&q=80',
    price: 9.50,
    is_active: true,
  },
  {
    id: 'prod-pudim',
    category_id: 'cat-sobremesas',
    name: 'Pudim Caseiro de Leite Condensado',
    description: 'Fatia individual de pudim super cremoso com bastante calda de caramelo.',
    image_url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800&auto=format&fit=crop&q=80',
    price: 10.00,
    is_active: true,
    is_popular: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 1001,
    customer: { name: 'Mariana Lima', phone: '(11) 98765-4321' },
    orderType: 'delivery',
    status: 'preparing',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    subtotal: 73.50,
    deliveryFee: 5.90,
    discount: 0,
    totalAmount: 79.40,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    estimatedMinutes: 35,
    deliveryAddress: {
      street: 'Av. Paulista',
      number: '1500',
      complement: 'Apto 82',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    items: [
      {
        id: 'item-1',
        type: 'pizza',
        pizzaSize: mockPizzaSizes[2], // Grande
        pizzaCrust: mockPizzaCrusts[1], // Catupiry
        pizzaFlavors: [mockPizzaFlavors[0], mockPizzaFlavors[1]],
        quantity: 1,
        unitPrice: 65.00 + 8.50,
        subtotal: 73.50,
        notes: 'Caprichar no orégano por favor!',
      }
    ]
  },
  {
    id: 'ord-1002',
    orderNumber: 1002,
    customer: { name: 'Carlos Eduardo', phone: '(11) 91234-5678' },
    orderType: 'delivery',
    status: 'pending',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    subtotal: 97.00,
    deliveryFee: 5.90,
    discount: 10.00,
    totalAmount: 92.90,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    estimatedMinutes: 40,
    deliveryAddress: {
      street: 'Rua Augusta',
      number: '420',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
    },
    items: [
      {
        id: 'item-2',
        type: 'pizza',
        pizzaSize: mockPizzaSizes[2], // Grande
        pizzaCrust: mockPizzaCrusts[0],
        pizzaFlavors: [mockPizzaFlavors[2]], // Camarão
        quantity: 1,
        unitPrice: 85.00,
        subtotal: 85.00,
      },
      {
        id: 'item-3',
        type: 'product',
        product: mockProducts[0], // Coca 2L
        quantity: 1,
        unitPrice: 14.00,
        subtotal: 14.00,
      }
    ]
  },
  {
    id: 'ord-1003',
    orderNumber: 1003,
    customer: { name: 'Fernanda Rocha', phone: '(11) 97777-8888' },
    orderType: 'takeaway',
    status: 'confirmed',
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    subtotal: 48.00,
    deliveryFee: 0,
    discount: 0,
    totalAmount: 48.00,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    estimatedMinutes: 20,
    items: [
      {
        id: 'item-4',
        type: 'pizza',
        pizzaSize: mockPizzaSizes[1], // Média
        pizzaCrust: mockPizzaCrusts[0],
        pizzaFlavors: [mockPizzaFlavors[3]], // Frango Catupiry
        quantity: 1,
        unitPrice: 48.00,
        subtotal: 48.00,
      }
    ]
  }
];

export const mockStoreSettings: StoreSettings = {
  isOpen: true,
  deliveryTimeMinutes: 35,
  deliveryFee: 5.90,
  minOrderValue: 20.00,
  storeAddress: 'Rua Haddock Lobo, 890 - Cerqueira César, São Paulo - SP',
  storePhone: '(11) 3255-0000',
};
