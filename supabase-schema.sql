-- ============================================
-- Foodie App - Database Schema
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. Tabela de Perfis de Usuário (profiles)
-- ============================================

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (role IN ('CLIENTE', 'ADMIN', 'GERENCIADOR', 'EQUIPE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios perfis
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Usuários podem atualizar seus próprios perfis
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Policy: Admins podem atualizar todos os perfis
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENTE')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Tabela de Restaurantes
-- ============================================

CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    cover_image TEXT,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Settings (stored as JSONB)
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver restaurantes ativos
CREATE POLICY "Anyone can view active restaurants" ON public.restaurants
    FOR SELECT USING (is_active = true);

-- Policy: Apenas admins e owners podem editar
CREATE POLICY "Owners can manage restaurants" ON public.restaurants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GERENCIADOR'))
        OR owner_id = auth.uid()
    );

-- ============================================
-- 3. Tabela de Categorias
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver categorias ativas
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Policy: Equipe do restaurante pode gerenciar
CREATE POLICY "Team can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.restaurants r ON r.owner_id = p.id
            WHERE p.id = auth.uid() AND r.id = restaurant_id
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GERENCIADOR'))
    );

-- ============================================
-- 4. Tabela de Produtos
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    badges TEXT[] DEFAULT '{}',
    options JSONB DEFAULT '[]'::jsonb,
    preparation_time INTEGER,
    calories INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver produtos ativos
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Policy: Equipe do restaurante pode gerenciar
CREATE POLICY "Team can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.restaurants r ON r.owner_id = p.id
            WHERE p.id = auth.uid() AND r.id = restaurant_id
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GERENCIADOR', 'EQUIPE'))
    );

-- ============================================
-- 5. Tabela de Endereços
-- ============================================

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    label TEXT,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários gerem seus próprios endereços
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 6. Tabela de Pedidos
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED')),
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    delivery_address JSONB,
    payment_method TEXT,
    observation TEXT,
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Clientes veem seus pedidos
CREATE POLICY "Customers view own orders" ON public.orders
    FOR SELECT USING (customer_id = auth.uid());

-- Policy: Restaurantes veem pedidos relacionados
CREATE POLICY "Restaurants view own orders" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GERENCIADOR', 'EQUIPE'))
    );

-- ============================================
-- Criar índices para performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON public.products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);

-- ============================================
-- Popular dados de exemplo (opcional)
-- ============================================

-- Inserir restaurante de exemplo
INSERT INTO public.restaurants (
    name,
    description,
    email,
    phone,
    city,
    state,
    is_active,
    is_open
) VALUES (
    'Foodie Restaurant',
    'O melhor restaurante de delivery da cidade',
    'contato@foodie.com',
    '11999999999',
    'São Paulo',
    'SP',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Inserir categorias de exemplo
INSERT INTO public.categories (restaurant_id, name, description, sort_order, is_active)
SELECT 
    r.id,
    c.name,
    c.description,
    c.sort_order,
    true
FROM public.restaurants r
CROSS JOIN (
    VALUES 
        ('Lanches', 'Deliciosos hambúrgueres e sanduíches', 1),
        ('Pizzas', 'Pizzas artesanais', 2),
        ('Bebidas', 'Refrigerantes, sucos e águas', 3),
        ('Sobremesas', 'Doces e sobremesas', 4)
) AS c(name, description, sort_order)
WHERE r.name = 'Foodie Restaurant'
ON CONFLICT DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO public.products (restaurant_id, category_id, name, description, price, is_available, badges)
SELECT 
    r.id,
    c.id,
    p.name,
    p.description,
    p.price,
    true,
    p.badges
FROM public.restaurants r
CROSS JOIN public.categories c
CROSS JOIN (
    VALUES 
        ('Hambúrguer Clássico', 'Pão, carne, alface, tomate, queijo', 25.90, ARRAY['popular']),
        ('Hambúrguer Bacon', 'Pão, carne, bacon, cheddar, onion rings', 29.90, ARRAY['popular']),
        ('X-Salada', 'Pão, carne, alface, tomate, maionese', 22.90, ARRAY[]::text[]),
        ('Pizza Margherita', 'Molho, mussarela, tomate, manjericão', 49.90, ARRAY['vegetarian']),
        ('Pizza Calabresa', 'Molho, mussarela, calabresa, cebola', 54.90, ARRAY[]::text[]),
        ('Refrigerante Lata', 'Coca-Cola, Pepsi, Guaraná', 5.90, ARRAY[]::text[]),
        ('Suco Natural', 'Laranja, Limão, Manga', 8.90, ARRAY[]::text[]),
        ('Pudim', 'Pudim de leite condensado', 12.90, ARRAY['popular']),
        ('Brigadeiro', '7 unidades', 15.90, ARRAY[]::text[])
) AS p(name, description, price, badges)
WHERE r.name = 'Foodie Restaurant'
AND c.name = 
    CASE 
        WHEN p.name LIKE '%Hambúrguer%' OR p.name LIKE '%X-%' THEN 'Lanches'
        WHEN p.name LIKE '%Pizza%' THEN 'Pizzas'
        WHEN p.name LIKE '%Refrigerante%' OR p.name LIKE '%Suco%' THEN 'Bebidas'
        WHEN p.name LIKE '%Pudim%' OR p.name LIKE '%Brigadeiro%' THEN 'Sobremesas'
    END
ON CONFLICT DO NOTHING;

-- ============================================
-- CONCLUÍDO!
-- ============================================

SELECT 'Database schema created successfully!' AS message;
