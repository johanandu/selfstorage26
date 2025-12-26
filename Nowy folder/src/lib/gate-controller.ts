import axios from 'axios';

const GATE_API_URL = import.meta.env.GATE_API_URL;
const GATE_API_TOKEN = import.meta.env.GATE_API_TOKEN;

interface GateResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export const triggerGateOpen = async (unitId: string, userId: string): Promise<GateResponse> => {
  if (!GATE_API_URL || !GATE_API_TOKEN) {
    // Symulacja dla developmentu
    console.log(`[GATE SIMULATION] Otwieranie bramy dla unit: ${unitId}, user: ${userId}`);
    
    // Symulacja opóźnienia sieci
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      message: 'Brama otwarta pomyślnie',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await axios.post<GateResponse>(
      `${GATE_API_URL}/open`,
      {
        unit_id: unitId,
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Authorization': `Bearer ${GATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 sekund timeoutu
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Błąd podczas otwierania bramy:', error);
    
    if (error.response) {
      throw new Error(`Błąd bramy: ${error.response.data.message || 'Nieznany błąd'}`);
    } else if (error.request) {
      throw new Error('Brak odpowiedzi z kontrolera bramy');
    } else {
      throw new Error('Błąd podczas komunikacji z kontrolerem bramy');
    }
  }
};

export const getGateStatus = async (unitId: string): Promise<{
  isOpen: boolean;
  lastOpened: string | null;
  status: 'online' | 'offline' | 'error';
}> => {
  if (!GATE_API_URL || !GATE_API_TOKEN) {
    // Symulacja dla developmentu
    return {
      isOpen: false,
      lastOpened: null,
      status: 'online',
    };
  }

  try {
    const response = await axios.get(
      `${GATE_API_URL}/status/${unitId}`,
      {
        headers: {
          'Authorization': `Bearer ${GATE_API_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Błąd podczas sprawdzania statusu bramy:', error);
    return {
      isOpen: false,
      lastOpened: null,
      status: 'offline',
    };
  }
};