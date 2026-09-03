-- Migration: 20260902010000_multi_tenant_schema.sql
-- Description: Schema Multi-Tenant Completo para SaaS White-Label de Restaurantes/Pizzarias
-- Otimizado para RLS (Row Level Security), Subdomínios, Planos de Assinatura e Edge Functions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS (Tipos Customizados do SaaS)
-- ============================================================================
CREATE TYPE staff_role AS ENUM ('super_admin', 'restaurant_owner', 'kitchen', 'deliveryman');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TYPE provision_status AS ENUM ('pending', 'active', 'failed');
CREATE TYPE multi_order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE multi_payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'cash');
CREATE TYPE multi_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ============================================================================
-- 2. TABELAS CENTRAIS DO SAAS (MULTITENANCY)
-- ============================================================================

-- PLANOS DO SAAS (Plans)
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL CHECK (price_monthly >= 0),
    max_products INT NOT NULL DEFAULT 50,
    max_orders_per_month INT NOT NULL DEFAULT 500,
    custom_domain_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESTAURANTES / TENANTS (Restaurants)
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Ex: "bella-pizza" (subdomínio: bella-pizza.deliveryapp.com)
    custom_domain TEXT UNIQUE, -- Ex: "pizzariabella.com.br"
    logo_url TEXT,
    banner_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONFIGURAÇÕES DO RESTAURANTE (Restaurant Settings 1:1)
CREATE TABLE public.restaurant_settings (
    restaurant_id UUID PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
    is_open BOOLEAN NOT NULL DEFAULT true,
    delivery_fee_default NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (delivery_fee_default >= 0),
    min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 20.00 CHECK (min_order_value >= 0),
    delivery_time_minutes INT NOT NULL DEFAULT 40 CHECK (delivery_time_minutes > 0),
    pix_key TEXT,
    store_address TEXT,
    store_phone TEXT,
    theme_primary_color TEXT NOT NULL DEFAULT '#E11D48',
    opening_hours JSONB, -- Ex: {"mon": "18:00-23:00", "tue": "18:00-23:00"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBDOMAIN PROVISIONS (Provisionamento Cloudflare API)
CREATE TABLE public.subdomain_provisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    subdomain TEXT NOT NULL,
    custom_domain TEXT,
    status provision_status NOT NULL DEFAULT 'pending',
    cloudflare_dns_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ASSINATURAS DO SAAS (Subscriptions)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID UNIQUE NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'trialing',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFIS DE EQUIPE / ROLES (Staff Profiles)
CREATE TABLE public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE, -- NULL para super_admin
    name TEXT NOT NULL,
    phone TEXT,
    role staff_role NOT NULL DEFAULT 'restaurant_owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TABELAS DO CARDÁPIO & OPERAÇÃO (COM RESTAURANT_ID)
-- ============================================================================

-- CATEGORIAS (Categories com restaurant_id)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(restaurant_id, slug)
);

-- PRODUTOS PRONTOS (Products com restaurant_id)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TAMANHOS DE PIZZA (Product Sizes com restaurant_id)
CREATE TABLE public.product_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: Grande (8 Fatias)
    slug TEXT NOT NULL,
    slices INT NOT NULL CHECK (slices > 0),
    max_flavors INT NOT NULL DEFAULT 3 CHECK (max_flavors >= 1 AND max_flavors <= 4),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(restaurant_id, slug)
);

-- SABORES DE PIZZA (Pizza Flavors com restaurant_id)
CREATE TABLE public.pizza_flavors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    ingredients TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PREÇOS POR SABOR E TAMANHO (Flavor Prices com restaurant_id)
CREATE TABLE public.pizza_flavor_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    flavor_id UUID NOT NULL REFERENCES public.pizza_flavors(id) ON DELETE CASCADE,
    size_id UUID NOT NULL REFERENCES public.product_sizes(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(flavor_id, size_id)
);

-- CLIENTES DO RESTAURANTE (Customers com restaurant_id)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PEDIDOS (Orders com restaurant_id)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_number INT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'takeaway')),
    status multi_order_status NOT NULL DEFAULT 'pending',
    payment_method multi_payment_method NOT NULL DEFAULT 'pix',
    payment_status multi_payment_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ITENS DO PEDIDO (Order Items)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('pizza', 'product')),
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    pizza_size_id UUID REFERENCES public.product_sizes(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ÍNDICES DE PERFORMANCE MULTI-TENANT
-- ============================================================================
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_restaurants_custom_domain ON public.restaurants(custom_domain);
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX idx_products_restaurant_id ON public.products(restaurant_id);
CREATE INDEX idx_pizza_flavors_restaurant_id ON public.pizza_flavors(restaurant_id);
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX idx_orders_created_at ON public.orders(restaurant_id, created_at DESC);
CREATE INDEX idx_staff_profiles_user_id ON public.staff_profiles(user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS POLICIES MULTI-TENANT)
-- ============================================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdomain_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_flavor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Super Admin Bypass Policy
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff_profiles
        WHERE user_id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leitura pública de restaurantes e cardápios ativos
CREATE POLICY "Leitura pública de restaurantes" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Leitura pública de settings" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Leitura pública de categorias" ON public.categories FOR SELECT USING (is_active = true OR public.is_super_admin());
CREATE POLICY "Leitura pública de produtos" ON public.products FOR SELECT USING (is_active = true OR public.is_super_admin());
CREATE POLICY "Leitura pública de tamanhos" ON public.product_sizes FOR SELECT USING (is_active = true OR public.is_super_admin());
CREATE POLICY "Leitura pública de sabores" ON public.pizza_flavors FOR SELECT USING (is_active = true OR public.is_super_admin());
CREATE POLICY "Leitura pública de preços" ON public.pizza_flavor_prices FOR SELECT USING (true);

-- Permissão de inserção e atualização de pedidos para o tenant
CREATE POLICY "Leitura de pedidos pelo dono/equipe" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() 
              AND (restaurant_id = orders.restaurant_id OR role = 'super_admin')
        )
    );

CREATE POLICY "Criação pública de pedidos" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Criação pública de itens do pedido" ON public.order_items FOR INSERT WITH CHECK (true);
