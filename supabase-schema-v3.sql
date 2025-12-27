-- ============================================
-- SELF-STORAGE SYSTEM v3.0 - PRODUCTION RELEASE
-- Schema bazy danych Supabase
-- ============================================

-- 1. B2B TEAM ACCESS
-- ============================================
CREATE TABLE public.access_shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id integer REFERENCES public.units(id) NOT NULL,
  guest_name text NOT NULL,
  guest_email text,
  access_code text NOT NULL,
  access_type text NOT NULL DEFAULT 'temporary', -- 'temporary', 'permanent', 'recurring'
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS dla access_shares
ALTER TABLE public.access_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shares" ON public.access_shares
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Guests can view their access" ON public.access_shares
  FOR SELECT
  TO authenticated
  USING (guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Indexy
CREATE INDEX idx_access_shares_owner ON public.access_shares(owner_id);
CREATE INDEX idx_access_shares_unit ON public.access_shares(unit_id);
CREATE INDEX idx_access_shares_code ON public.access_shares(access_code);

-- 2. MOVE-OUT PROOFS (STORAGE BUCKET)
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('move-out-proofs', 'move-out-proofs', false) ON CONFLICT DO NOTHING;

-- Polityki storage
CREATE POLICY "User can upload move-out proof" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'move-out-proofs');

CREATE POLICY "User can view their proofs" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'move-out-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. MAPS - LOKALIZACJE MAGAZYNÓW
-- ============================================
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS address_display text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text;

-- 4. FAQ
-- ============================================
CREATE TABLE public.faq (
  id serial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Dane przykładowe FAQ
INSERT INTO public.faq (question, answer, category, order_index) VALUES
  ('Jak mogę wynająć magazyn?', 'Wybierz odpowiedni rozmiar na naszej stronie, przejdź przez konfigurator i dokonaj płatności. Brama otworzy się automatycznie.', 'general', 1),
  ('Czy mogę anulować wynajem w każdej chwili?', 'Tak, możesz anulować wynajem w każdej chwili. Zwracamy niewykorzystaną część opłaty.', 'billing', 2),
  ('Jak działa otwieranie bramy?', 'Po opłaceniu wynajmu otrzymasz dostęp do panelu, gdzie znajdziesz przycisk "Otwórz bramę".', 'technical', 3),
  ('Czy magazyny są monitorowane?', 'Tak, wszystkie magazyny są monitorowane 24/7 oraz zabezpieczone systemem alarmowym.', 'security', 4),
  ('Jak mogę udostępnić dostęp komuś innemu?', 'W panelu klienta znajdziesz opcję "Udostępnij dostęp". Możesz wygenerować kod dostępu.', 'sharing', 5)
ON CONFLICT DO NOTHING;

-- 5. MOVE-OUT REQUESTS
-- ============================================
CREATE TABLE public.move_out_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id integer REFERENCES public.units(id) NOT NULL,
  requested_at timestamptz DEFAULT now(),
  proof_image_url text,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  processed_at timestamptz,
  admin_notes text,
  stripe_subscription_id text,
  cancel_at_period_end boolean DEFAULT false,
  UNIQUE(user_id, unit_id)
);

-- RLS dla move_out_requests
ALTER TABLE public.move_out_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their move-out requests" ON public.move_out_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. TEAM INVITATIONS
-- ============================================
CREATE TABLE public.team_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) NOT NULL,
  unit_id integer REFERENCES public.units(id) NOT NULL,
  guest_email text NOT NULL,
  invitation_code text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS dla team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their invitations" ON public.team_invitations
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 7. UPDATE EXISTING TABLES
-- ============================================
-- Dodaj kolumnę do subscriptions dla B2B
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_b2b boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_nip text;

-- Dodaj kolumnę do profiles dla lepszej integracji z OAuth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'email';

-- 8. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_access_shares_active ON public.access_shares(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_move_out_requests_status ON public.move_out_requests(status);
CREATE INDEX IF NOT EXISTS idx_units_location ON public.units(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_team_invitations_code ON public.team_invitations(invitation_code);

-- 9. FUNCTIONS & TRIGGERS
-- ============================================
-- Funkcja do czyszczenia przeterminowanych dostępów
CREATE OR REPLACE FUNCTION public.cleanup_expired_access()
RETURNS void AS $$
BEGIN
  UPDATE public.access_shares 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  UPDATE public.team_invitations 
  SET status = 'expired' 
  WHERE expires_at < now() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Cron job do uruchamiania cleanup (wymaga pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-access', '0 */6 * * *', 'SELECT public.cleanup_expired_access()');

-- 10. WEBHOOK ENDPOINTS FOR STRIPE
-- ============================================
-- Dodaj kolumnę do webhook logs
ALTER TABLE public.gate_logs 
ADD COLUMN IF NOT EXISTS webhook_event text,
ADD COLUMN IF NOT EXISTS stripe_event_id text;

-- 11. SECURITY ENHANCEMENTS
-- ============================================
-- Dodaj rate limiting do gate API (logi)
CREATE TABLE public.api_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- 12. ANALYTICS (Optional)
-- ============================================
CREATE TABLE public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  event_name text NOT NULL,
  event_properties jsonb,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id, timestamp);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name, timestamp);