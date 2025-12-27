import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Pobierz jednostki z lokalizacją
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, size, price_gross, status, latitude, longitude, address_display')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    if (error) {
      throw error;
    }

    // Jeśli brak lokalizacji, zwróć mock data
    if (!units || units.length === 0) {
      const mockUnits = [
        {
          id: 1,
          name: 'Box A1',
          size: '5m²',
          price_gross: 20000,
          status: 'available',
          latitude: 52.2297,
          longitude: 21.0122,
          address_display: 'ul. Przykładowa 123, 00-001 Warszawa',
        },
        {
          id: 2,
          name: 'Box A2',
          size: '8m²',
          price_gross: 32000,
          status: 'occupied',
          latitude: 52.2307,
          longitude: 21.0132,
          address_display: 'ul. Przykładowa 125, 00-001 Warszawa',
        },
        {
          id: 3,
          name: 'Box A3',
          size: '12m²',
          price_gross: 48000,
          status: 'available',
          latitude: 52.2287,
          longitude: 21.0112,
          address_display: 'ul. Przykładowa 127, 00-001 Warszawa',
        },
      ];
      
      return new Response(JSON.stringify(mockUnits), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(units), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Błąd API units/map:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Błąd serwera' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};