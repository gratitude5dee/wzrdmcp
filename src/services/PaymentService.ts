import { PaymentIntent } from '../types/domain.js';
import { logError } from '../utils/logger.js';

interface PaymentServiceOptions {
  pspBaseUrl: string;
  pspApiKey: string;
}

interface PaymentIntentResponse {
  id: string;
  status: PaymentIntent['status'];
  client_secret?: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: PaymentServiceOptions) {
    this.baseUrl = options.pspBaseUrl.replace(/\/$/, '');
    this.apiKey = options.pspApiKey;
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      logError('PSP request failed', { path, status: response.status, body: text });
      throw new Error(`PSP request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async createIntent(sessionId: string, amount: number): Promise<PaymentIntent> {
    const payload = await this.request<PaymentIntentResponse>('/payment_intents', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, amount }),
    });

    return {
      id: payload.id,
      amount: { value: payload.amount, currency: payload.currency },
      status: payload.status,
      client_secret: payload.client_secret,
    };
  }

  async confirmIntent(intentId: string): Promise<PaymentIntent> {
    const payload = await this.request<PaymentIntentResponse>(`/payment_intents/${intentId}/confirm`, {
      method: 'POST',
    });

    return {
      id: payload.id,
      amount: { value: payload.amount, currency: payload.currency },
      status: payload.status,
      client_secret: payload.client_secret,
    };
  }

  async getIntent(intentId: string): Promise<PaymentIntent> {
    const payload = await this.request<PaymentIntentResponse>(`/payment_intents/${intentId}`, {
      method: 'GET',
    });

    return {
      id: payload.id,
      amount: { value: payload.amount, currency: payload.currency },
      status: payload.status,
      client_secret: payload.client_secret,
    };
  }
}
