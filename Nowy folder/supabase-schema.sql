-- ============================================
-- SELF-STORAGE SYSTEM v1.0
-- Schema bazy danych Supabase
-- ============================================

-- 1. TABELE GŁÓWNE
-- ============================================

-- Tabela użytkowników (profile)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  phone_number text, -- NIEZBĘDNE do SMS/Bramy
  nip text,          -- DO FAKTUROWNII (Opcjonalne dla B2B)
  address text,      -- DO FAKTUROWNII
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela jednostek (magazynów)
CREATE TABLE public.units (
  id serial PRIMARY KEY,
  name text NOT NULL,         -- "Box A1"
  size text NOT NULL,         -- "5m2"
  price_gross integer NOT NULL, -- Cena brutto w groszach (np. 20000 = 200 PLN)
  status text NOT NULL DEFAULT 'available', -- 'available', 'occupied'
  image_url text,             -- Do kafelków premium
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela subskrypcji
CREATE TABLE public.subscriptions (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles NOT NULL,
  unit_id integer REFERENCES public.units NOT NULL,
  status text NOT NULL DEFAULT 'active', -- 'active', 'unpaid', 'cancelled'
  valid_until timestamptz NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- Tabela logów bramy
CREATE TABLE public.gate_logs (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES public.profiles NOT NULL,
  unit_id integer REFERENCES public.units NOT NULL,
  action text NOT NULL, -- 'open', 'failed'
  timestamp timestamptz DEFAULT now(),
  ip_address inet
);

-- 2. INDEXES
-- ============================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_unit_id ON public.subscriptions(unit_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_valid_until ON public.subscriptions(valid_until);
CREATE INDEX idx_gate_logs_user_id ON public.gate_logs(user_id);
CREATE INDEX idx_gate_logs_timestamp ON public.gate_logs(timestamp);

-- 3. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Każdy może zobaczyć swój profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Każdy może zaktualizować swój profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Units RLS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Każdy może przeglądać jednostki (dla landing page)
CREATE POLICY "Anyone can view units" ON public.units
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Tylko admin może modyfikować jednostki (brak RLS dla admin - używamy service key)

-- Subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą widzieć tylko swoje subskrypcje
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Użytkownicy mogą tworzyć subskrypcje tylko dla siebie
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Użytkownicy mogą aktualizować tylko swoje subskrypcje
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gate Logs RLS
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą widzieć tylko swoje logi
CREATE POLICY "Users can view own gate logs" ON public.gate_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Użytkownicy mogą tworzyć logi (przez API bramy)
CREATE POLICY "Users can create gate logs" ON public.gate_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Funkcja do aktualizacji updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. DANE POCZĄTKOWE (OPCJONALNIE)
-- ============================================

-- Przykładowe jednostki
INSERT INTO public.units (name, size, price_gross, status, image_url) VALUES
  ('Box A1', '5m²', 20000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  ('Box A2', '8m²', 32000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  ('Box A3', '12m²', 48000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  ('Box B1', '5m²', 20000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  ('Box B2', '8m²', 32000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
  ('Box B3', '12m²', 48000, 'available', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop')
ON CONFLICT DO NOTHING;

-- 6. STORAGE BUCKET (dla obrazków)
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('units', 'units', true) ON CONFLICT DO NOTHING;

-- Polityki dla storage
CREATE POLICY "Public access to units images" ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'units');

CREATE POLICY "Admins can upload unit images" ON storage.objects
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  WITH CHECK (bucket_id = 'units' AND auth.jwt() ->> 'role' = 'admin');