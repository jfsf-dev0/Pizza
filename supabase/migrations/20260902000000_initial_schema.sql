-- Migration: 20260902000000_initial_schema.sql
-- Description: Schema completo para PWA de Pizzaria com RLS, Indexes, Triggers e Regra de Preço do Maior Sabor

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS (Tipos Customizados)
-- ============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'attendant', 'deliveryman', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE item_type AS ENUM ('pizza', 'product');

-- ============================================================================
-- 2. TABELAS DA APLICAÇÃO
-- ============================================================================

-- PROFILES (Extende auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADDRESSES (Endereços de entrega dos clientes)
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'São Paulo',
    state TEXT NOT NULL DEFAULT 'SP',
    zip_code TEXT NOT NULL,
    reference_point TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES (Categorias do cardápio: Pizzas Tradicionais, Especiais, Bebidas, Sobremesas)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS (Produtos prontos: Bebidas, Sobremesas, Entradas)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIZZA SIZES (Tamanhos de Pizza: Broto, Média, Grande, Gigante)
CREATE TABLE public.pizza_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Ex: Grande
    slug TEXT UNIQUE NOT NULL, -- Ex: grande
    slices INT NOT NULL CHECK (slices > 0), -- Ex: 8 fatias
    max_flavors INT NOT NULL DEFAULT 3 CHECK (max_flavors >= 1 AND max_flavors <= 3), -- Máximo de 3 sabores
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIZZA CRUSTS (Bordas Recheadas: Catupiry, Cheddar, Chocolate, etc.)
CREATE TABLE public.pizza_crusts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIZZA FLAVORS (Sabores de Pizza)
CREATE TABLE public.pizza_flavors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    ingredients TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIZZA FLAVOR PRICES (Preço por Sabor e Tamanho)
CREATE TABLE public.pizza_flavor_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flavor_id UUID NOT NULL REFERENCES public.pizza_flavors(id) ON DELETE CASCADE,
    size_id UUID NOT NULL REFERENCES public.pizza_sizes(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(flavor_id, size_id)
);

-- ORDERS (Pedidos)
CREATE SEQUENCE public.order_number_seq START WITH 1000 INCREMENT BY 1;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number INT NOT NULL DEFAULT nextval('public.order_number_seq'),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address JSONB NOT NULL, -- Snapshot do endereço no momento do pedido
    change_for NUMERIC(10, 2), -- Troco para quanto (se dinheiro)
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS (Itens do Pedido)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    pizza_size_id UUID REFERENCES public.pizza_sizes(id) ON DELETE RESTRICT,
    pizza_crust_id UUID REFERENCES public.pizza_crusts(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT order_item_type_check CHECK (
        (item_type = 'product' AND product_id IS NOT NULL AND pizza_size_id IS NULL) OR
        (item_type = 'pizza' AND pizza_size_id IS NOT NULL AND product_id IS NULL)
    )
);

-- ORDER ITEM FLAVORS (Sabores selecionados para a pizza do pedido)
CREATE TABLE public.order_item_flavors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    flavor_id UUID NOT NULL REFERENCES public.pizza_flavors(id) ON DELETE RESTRICT,
    price_at_time NUMERIC(10, 2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_pizza_flavors_category_id ON public.pizza_flavors(category_id);
CREATE INDEX idx_pizza_flavor_prices_lookup ON public.pizza_flavor_prices(size_id, flavor_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_item_flavors_order_item_id ON public.order_item_flavors(order_item_id);

-- ============================================================================
-- 4. FUNÇÕES E TRIGGERS DE NEGÓCIO
-- ============================================================================

-- Função para atualizar automática de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_pizza_flavors_updated_at BEFORE UPDATE ON public.pizza_flavors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para criar perfil automaticamente no SignUp (auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função auxiliar: Calcular preço unitário da pizza com base na REGRA DO MAIOR VALOR
CREATE OR REPLACE FUNCTION public.calculate_pizza_unit_price(
    p_size_id UUID,
    p_crust_id UUID,
    p_flavor_ids UUID[]
) RETURNS NUMERIC AS $$
DECLARE
    v_max_flavor_price NUMERIC(10, 2) := 0;
    v_crust_price NUMERIC(10, 2) := 0;
    v_max_flavors INT;
    v_num_flavors INT;
BEGIN
    -- Validar tamanho e limite de sabores
    SELECT max_flavors INTO v_max_flavors FROM public.pizza_sizes WHERE id = p_size_id AND is_active = true;
    IF v_max_flavors IS NULL THEN
        RAISE EXCEPTION 'Tamanho de pizza inválido ou inativo. ID: %', p_size_id;
    END IF;

    v_num_flavors := array_length(p_flavor_ids, 1);
    IF v_num_flavors IS NULL OR v_num_flavors < 1 THEN
        RAISE EXCEPTION 'Selecione ao menos 1 sabor para a pizza.';
    END IF;

    IF v_num_flavors > 3 OR v_num_flavors > v_max_flavors THEN
        RAISE EXCEPTION 'Limite de sabores excedido. Selecionados: %, Máximo permitido: %', v_num_flavors, LEAST(3, v_max_flavors);
    END IF;

    -- Regra da Pizza: Obter o MAIOR valor entre os sabores selecionados para o tamanho específico
    SELECT COALESCE(MAX(price), 0) INTO v_max_flavor_price
    FROM public.pizza_flavor_prices
    WHERE size_id = p_size_id 
      AND flavor_id = ANY(p_flavor_ids);

    IF v_max_flavor_price = 0 THEN
        RAISE EXCEPTION 'Um ou mais sabores selecionados não possuem preço cadastrado para este tamanho.';
    END IF;

    -- Adicionar valor da borda (se houver)
    IF p_crust_id IS NOT NULL THEN
        SELECT COALESCE(price, 0) INTO v_crust_price
        FROM public.pizza_crusts
        WHERE id = p_crust_id AND is_active = true;
    END IF;

    RETURN v_max_flavor_price + v_crust_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_crusts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_flavor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_flavors ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar permissão de Staff (Admin/Atendente/Entregador)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'attendant', 'deliveryman')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS DE PROFILES
CREATE POLICY "Usuários veem próprio perfil; Staff vê todos" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Usuários alteram próprio perfil; Staff altera todos" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_staff());

-- POLÍTICAS DE ADDRESSES
CREATE POLICY "Usuários gerenciam próprios endereços" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_staff());

-- POLÍTICAS DE CARDÁPIO (Leitura pública / Escrita apenas Staff)
CREATE POLICY "Leitura pública de categorias ativas" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Gestão de categorias por Staff" ON public.categories
    FOR ALL USING (public.is_staff());

CREATE POLICY "Leitura pública de produtos ativos" ON public.products
    FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Gestão de produtos por Staff" ON public.products
    FOR ALL USING (public.is_staff());

CREATE POLICY "Leitura pública de tamanhos ativos" ON public.pizza_sizes
    FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Gestão de tamanhos por Staff" ON public.pizza_sizes
    FOR ALL USING (public.is_staff());

CREATE POLICY "Leitura pública de bordas ativas" ON public.pizza_crusts
    FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Gestão de bordas por Staff" ON public.pizza_crusts
    FOR ALL USING (public.is_staff());

CREATE POLICY "Leitura pública de sabores ativos" ON public.pizza_flavors
    FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Gestão de sabores por Staff" ON public.pizza_flavors
    FOR ALL USING (public.is_staff());

CREATE POLICY "Leitura pública de preços de sabores" ON public.pizza_flavor_prices
    FOR SELECT USING (true);
CREATE POLICY "Gestão de preços por Staff" ON public.pizza_flavor_prices
    FOR ALL USING (public.is_staff());

-- POLÍTICAS DE ORDERS
CREATE POLICY "Clientes veem próprios pedidos; Staff vê todos" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "Clientes podem criar pedidos" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff altera status dos pedidos" ON public.orders
    FOR UPDATE USING (public.is_staff());

-- POLÍTICAS DE ORDER ITEMS E ITEM FLAVORS
CREATE POLICY "Acesso aos itens do pedido" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_staff()))
    );

CREATE POLICY "Inserção de itens no próprio pedido" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
    );

CREATE POLICY "Acesso aos sabores dos itens" ON public.order_item_flavors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.order_items oi
            JOIN public.orders o ON o.id = oi.order_id
            WHERE oi.id = order_item_flavors.order_item_id AND (o.user_id = auth.uid() OR public.is_staff())
        )
    );

CREATE POLICY "Inserção de sabores nos itens" ON public.order_item_flavors
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.order_items oi
            JOIN public.orders o ON o.id = oi.order_id
            WHERE oi.id = order_item_flavors.order_item_id AND o.user_id = auth.uid()
        )
    );
