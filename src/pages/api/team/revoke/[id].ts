import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const shareId = params.id;
    
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

    // Zdezaktywuj udostępnienie
    const { error: updateError } = await supabase
      .from('access_shares')
      .update({ is_active: false })
      .eq('id', shareId)
      .eq('owner_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Błąd API team/revoke:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};