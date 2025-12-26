import axios from 'axios';

const API_TOKEN = import.meta.env.FAKTUROWNIA_API_TOKEN;
const DOMAIN = import.meta.env.FAKTUROWNIA_DOMAIN;

if (!API_TOKEN || !DOMAIN) {
  throw new Error('Brak konfiguracji Fakturownia');
}

const fakturowniaClient = axios.create({
  baseURL: `https://${DOMAIN}.fakturownia.pl`,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface InvoiceData {
  buyer_name: string;
  buyer_email: string;
  buyer_tax_no?: string; // NIP
  buyer_address?: string;
  positions: {
    name: string;
    tax: number;
    total_price_gross: number;
    quantity: number;
  }[];
  payment_method?: string;
  send_invoice_automatically?: boolean;
}

export const createInvoice = async (invoiceData: InvoiceData) => {
  try {
    const response = await fakturowniaClient.post('/invoices.json', {
      api_token: API_TOKEN,
      invoice: {
        kind: 'vat',
        number: null, // Automatyczny numer
        sell_date: new Date().toISOString().split('T')[0],
        issue_date: new Date().toISOString().split('T')[0],
        payment_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        buyer_name: invoiceData.buyer_name,
        buyer_email: invoiceData.buyer_email,
        buyer_tax_no: invoiceData.buyer_tax_no,
        buyer_address: invoiceData.buyer_address,
        positions: invoiceData.positions,
        payment_method: invoiceData.payment_method || 'transfer',
        send_invoice_automatically: invoiceData.send_invoice_automatically !== false,
        automatic_paid_status: false,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Błąd podczas tworzenia faktury:', error);
    throw error;
  }
};

export const sendInvoiceByEmail = async (invoiceId: string) => {
  try {
    const response = await fakturowniaClient.post(`/invoices/${invoiceId}/send_by_email.json`, {
      api_token: API_TOKEN,
    });

    return response.data;
  } catch (error) {
    console.error('Błąd podczas wysyłania faktury:', error);
    throw error;
  }
};

export const getInvoicePDF = async (invoiceId: string) => {
  try {
    const response = await fakturowniaClient.get(`/invoices/${invoiceId}.pdf`, {
      api_token: API_TOKEN,
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania PDF:', error);
    throw error;
  }
};