import { createClient } from '@supabase/supabase-js';

// 1. Pobieramy klucze bezpiecznie (obsługa Vite i Node)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

// 2. Walidacja (żebyś widział w logach, jeśli czegoś brakuje)
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Brakuje zmiennych środowiskowych Supabase!');
}

// 3. Eksport (Named Export - to jest kluczowe dla import { supabase })
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');