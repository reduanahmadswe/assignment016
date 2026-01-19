/**
 * Payment Service Type Definitions
 */

export interface UddoktaPayCreateResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

export interface UddoktaPayVerifyResponse {
  full_name: string;
  email: string;
  amount: string;
  fee: string;
  charged_amount: string;
  invoice_id: string;
  metadata: {
    user_id: string;
    event_id: string;
    transaction_id: string;
    registration_id?: string;
  };
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'ERROR';
}

export interface InitiatePaymentInput {
  event_id: number;
  amount?: number;
  ip_address?: string;
  user_agent?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: string;
  message: string;
  registration_number?: string | null;
  event_title?: string;
  already_processed?: boolean;
  registration?: any;
  transaction?: any;
}

export interface PaymentFilters {
  status?: string;
  userId?: number;
  eventId?: number;
  page?: number;
  limit?: number;
}

export interface PaymentConfig {
  apiKey: string;
  apiUrl: string;
  verifyUrl: string;
}
