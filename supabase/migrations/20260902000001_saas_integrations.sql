-- Migration: 20260902000001_saas_integrations.sql
-- Description: Multi-tenant SaaS Settings, Mercado Pago Gateway Config & Cloudflare Subdomain Tracking

-- 1. TABELA DE RESTAURANTES (TENANTS)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    plan_type TEXT NOT NULL DEFAULT 'standard', -- 'standard' (R$ 119) ou 'custom'
    subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA RESTAURANT SETTINGS (Configuração de Gateway Mercado Pago e Cloudflare)
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
    subdomain TEXT UNIQUE, -- ex: "pizzariadoze"
    full_domain TEXT UNIQUE, -- ex: "pizzariadoze.meusaaspizza.com.br"
    cloudflare_dns_id TEXT, -- ID do registro CNAME no Cloudflare
    subdomain_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'failed'
    
    -- Configurações de Gateway Mercado Pago por Restaurante (JSONB Encriptado / Seguro)
    gateway_config JSONB NOT NULL DEFAULT '{
        "provider": "mercadopago",
        "access_token": null,
        "public_key": null,
        "webhook_secret": null,
        "sandbox_mode": true
    }'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_subdomain ON public.restaurant_settings(subdomain);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);

-- 4. RLS POLICIES
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dono gerencia seu restaurante" ON public.restaurants
    FOR ALL USING (auth.uid() = owner_id OR public.is_staff());

CREATE POLICY "Dono gerencia configurações de seu restaurante" ON public.restaurant_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_settings.restaurant_id AND (r.owner_id = auth.uid() OR public.is_staff()))
    );
