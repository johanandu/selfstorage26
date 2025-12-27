import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { createServiceClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Pobierz token z ciasteczek
    const token = request.headers.get('cookie')?.match(/sb-access-token=([^;]+)/)?.[1];
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ustaw token dla Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowa autoryzacja' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz dane z body
    const { unitId, guestName, guestEmail, accessType, duration } = await request.json();

    // Walidacja
    if (!unitId || !guestName || !accessType) {
      return new Response(JSON.stringify({ error: 'Brak wymaganych danych' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sprawdź czy użytkownik jest właścicielem magazynu
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('unit_id', unitId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'Nie jesteś właścicielem tego magazynu' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generuj unikalny kod dostępu
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Oblicz datę wygaśnięcia
    let expiresAt = null;
    if (accessType === 'temporary' && duration) {
      expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
    }

    // Zapisz w bazie
    const { data: share, error: shareError } = await supabase
      .from('access_shares')
      .insert({
        owner_id: user.id,
        unit_id: unitId,
        guest_name: guestName,
        guest_email: guestEmail,
        access_code: accessCode,
        access_type: accessType,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) {
      throw shareError;
    }

    return new Response(JSON.stringify(share), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Błąd API team/share:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    // Pobierz token z ciasteczek
    const token = request.headers.get('cookie')?.match(/sb-access-token=([^;]+)/)?.[1];
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ustaw token dla Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowa autoryzacja' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz aktywne udostępnienia użytkownika
    const { data: shares, error: sharesError } = await supabase
      .from('access_shares')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (sharesError) {
      throw sharesError;
    }

    return new Response(JSON.stringify(shares), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Błąd API team/share GET:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};