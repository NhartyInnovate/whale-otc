import { Resend } from 'resend';
import { OrderPayload, NotificationResult } from './types';
import OperatorNewOrder from '../../emails/OperatorNewOrder';
import CustomerOrderConfirmation from '../../emails/CustomerOrderConfirmation';
import CustomerOrderCompleted from '../../emails/CustomerOrderCompleted';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const operatorEmail = process.env.WHALE_OPERATOR_EMAIL || 'admin@whale.com'; // Fallback if not configured for development
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Whale OTC <onboarding@resend.dev>';

export async function sendOperatorEmail(order: OrderPayload): Promise<NotificationResult> {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Skipping operator email.');
    return { success: false, channel: 'email', error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: operatorEmail,
      subject: `New Whale Order - ${order.order_reference}`,
      react: OperatorNewOrder({ order }),
    });

    if (error) {
      console.error('Resend error (operator):', error);
      return { success: false, channel: 'email', error: error.message };
    }

    return { success: true, channel: 'email', providerMessageId: data?.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Operator email failed:', errorMessage);
    return { success: false, channel: 'email', error: errorMessage };
  }
}

export async function sendCustomerEmail(order: OrderPayload): Promise<NotificationResult> {
  if (!order.customer_email) {
    return { success: false, channel: 'email', error: 'No customer email provided' };
  }

  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Skipping customer email.');
    return { success: false, channel: 'email', error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: `Whale Order Received - ${order.order_reference}`,
      react: CustomerOrderConfirmation({ order }),
    });

    if (error) {
      console.error('Resend error (customer):', error);
      return { success: false, channel: 'email', error: error.message };
    }

    return { success: true, channel: 'email', providerMessageId: data?.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Customer email failed:', errorMessage);
    return { success: false, channel: 'email', error: errorMessage };
  }
}

export async function sendCustomerCompletedEmail(order: OrderPayload): Promise<NotificationResult> {
  if (!order.customer_email) {
    return { success: false, channel: 'email', error: 'No customer email provided' };
  }

  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Skipping customer completed email.');
    return { success: false, channel: 'email', error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: `Whale Order Completed – ${order.order_reference}`,
      react: CustomerOrderCompleted({ order }),
    });

    if (error) {
      console.error('Resend error (customer completed):', error);
      return { success: false, channel: 'email', error: error.message };
    }

    return { success: true, channel: 'email', providerMessageId: data?.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Customer completed email failed:', errorMessage);
    return { success: false, channel: 'email', error: errorMessage };
  }
}
