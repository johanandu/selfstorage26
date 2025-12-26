import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak zmiennych środowiskowych Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (tylko dla serwera)
export const createServiceClient = () => {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Brak SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};