-- Seed Data for Pizzaria PWA

-- 1. Categorias
INSERT INTO public.categories (id, name, slug, display_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Pizzas Salgadas', 'pizzas-salgadas', 1),
('22222222-2222-2222-2222-222222222222', 'Pizzas Doces', 'pizzas-doces', 2),
('33333333-3333-3333-3333-333333333333', 'Bebidas', 'bebidas', 3),
('44444444-4444-4444-4444-444444444444', 'Sobremesas', 'sobremesas', 4);

-- 2. Tamanhos de Pizza
INSERT INTO public.pizza_sizes (id, name, slug, slices, max_flavors, display_order) VALUES
('a1111111-1111-1111-1111-111111111111', 'Broto (4 Fatias)', 'broto', 4, 2, 1),
('a2222222-2222-2222-2222-222222222222', 'Média (6 Fatias)', 'media', 6, 2, 2),
('a3333333-3333-3333-3333-333333333333', 'Grande (8 Fatias)', 'grande', 8, 3, 3),
('a4444444-4444-4444-4444-444444444444', 'Gigante (12 Fatias)', 'gigante', 12, 3, 4);

-- 3. Bordas Recheadas
INSERT INTO public.pizza_crusts (id, name, price) VALUES
('b1111111-1111-1111-1111-111111111111', 'Sem Borda', 0.00),
('b2222222-2222-2222-2222-222222222222', 'Borda de Catupiry Original', 8.50),
('b3333333-3333-3333-3333-333333333333', 'Borda de Cheddar', 8.50),
('b4444444-4444-4444-4444-444444444444', 'Borda de Chocolate ao Leite', 10.00);

-- 4. Sabores de Pizza
INSERT INTO public.pizza_flavors (id, category_id, name, description, ingredients) VALUES
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Calabresa Tradicional', 'Calabresa fatiada, cebola e azeitonas pretas', ARRAY['molho de tomate', 'mussarela', 'calabresa', 'cebola', 'orégano']),
('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Quatro Queijos Premium', 'Mussarela, provolone, parmesão e catupiry legítimo', ARRAY['molho de tomate', 'mussarela', 'provolone', 'parmesão', 'catupiry']),
('f3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Camarão Catupiry', 'Camarões selecionados ao alho e óleo com cobertura de catupiry', ARRAY['molho de tomate', 'mussarela', 'camarão', 'catupiry', 'alho frito']),
('f4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Nutella com Morango', 'Creme de Nutella original coberto com morangos frescos fatiados', ARRAY['nutella', 'morango', 'leite condensado']);

-- 5. Preços dos Sabores por Tamanho
-- Sabor 1: Calabresa (Broto: 35.00, Média: 45.00, Grande: 55.00, Gigante: 70.00)
INSERT INTO public.pizza_flavor_prices (flavor_id, size_id, price) VALUES
('f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 35.00),
('f1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 45.00),
('f1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 55.00),
('f1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 70.00);

-- Sabor 2: Quatro Queijos Premium (Broto: 40.00, Média: 52.00, Grande: 65.00, Gigante: 82.00)
INSERT INTO public.pizza_flavor_prices (flavor_id, size_id, price) VALUES
('f2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 40.00),
('f2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 52.00),
('f2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 65.00),
('f2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 82.00);

-- Sabor 3: Camarão Catupiry (Broto: 50.00, Média: 68.00, Grande: 85.00, Gigante: 105.00)
INSERT INTO public.pizza_flavor_prices (flavor_id, size_id, price) VALUES
('f3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 50.00),
('f3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 68.00),
('f3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 85.00),
('f3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 105.00);

-- Sabor 4: Nutella (Broto: 38.00, Média: 48.00, Grande: 60.00, Gigante: 78.00)
INSERT INTO public.pizza_flavor_prices (flavor_id, size_id, price) VALUES
('f4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 38.00),
('f4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 48.00),
('f4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 60.00),
('f4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 78.00);

-- 6. Produtos (Bebidas e Sobremesas)
INSERT INTO public.products (category_id, name, description, price) VALUES
('33333333-3333-3333-3333-333333333333', 'Coca-Cola 2L', 'Refrigerante garrafa 2 litros bem gelado', 14.00),
('33333333-3333-3333-3333-333333333333', 'Guaraná Antarctica 2L', 'Refrigerante garrafa 2 litros', 12.00),
('33333333-3333-3333-3333-333333333333', 'Cerveja Heineken Long Neck 330ml', 'Cerveja premium gelada', 9.50),
('44444444-4444-4444-4444-444444444444', 'Pudim de Leite Condensado 150g', 'Pudim caseiro com calda de caramelo', 10.00);
