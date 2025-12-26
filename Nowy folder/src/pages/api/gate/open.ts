import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { triggerGateOpen } from '../../../lib/gate-controller';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Pobierz token z ciasteczek
    const token = cookies.get('sb-access-token');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Ustaw token dla Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token.value);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowa autoryzacja' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Pobierz dane z body
    const { unitId } = await request.json();

    if (!unitId) {
      return new Response(JSON.stringify({ error: 'Brak ID jednostki' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Sprawdź aktywną subskrypcję
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        units (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('unit_id', unitId)
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString())
      .single();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ 
        error: 'Brak aktywnej subskrypcji dla tej jednostki. Opłać zaległość, by wjechać.' 
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Otwórz bramę
    const result = await triggerGateOpen(unitId, user.id);

    if (result.success) {
      // Zaloguj otwarcie bramy
      await supabase.from('gate_logs').insert({
        user_id: user.id,
        unit_id: unitId,
        action: 'open',
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('Błąd API bramy:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};