export type NotificationChannel = 'email' | 'whatsapp';
export type NotificationEventType = 'operator_new_order' | 'customer_order_confirmation' | 'customer_order_completed';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface OrderPayload {
  id: string;
  order_reference: string;
  side: string;
  asset: string;
  input_amount: number;
  input_currency: string;
  output_amount: number;
  output_currency: string;
  customer_rate: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  wallet_address: string | null;
  wallet_network: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  status: string;
  created_at: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  providerMessageId?: string;
  error?: string;
}

export interface NotificationEventInsert {
  order_id: string;
  channel: NotificationChannel;
  recipient: string;
  event_type: NotificationEventType;
  status: NotificationStatus;
  provider_message_id?: string;
  error_message?: string;
}
