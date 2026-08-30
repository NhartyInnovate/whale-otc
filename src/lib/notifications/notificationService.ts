import { supabaseAdmin } from '../supabase';
import { OrderPayload, NotificationEventInsert } from './types';
import { sendOperatorEmail, sendCustomerEmail, sendCustomerCompletedEmail } from './email';
import { sendOperatorWhatsApp, sendCustomerWhatsApp } from './whatsapp';

/**
 * Persists the notification attempt to the Supabase database.
 * This is resilient and won't crash the calling function if it fails.
 */
async function logNotificationEvent(event: NotificationEventInsert) {
  try {
    const { error } = await supabaseAdmin.from('notification_events').insert({
      order_id: event.order_id,
      channel: event.channel,
      recipient: event.recipient,
      event_type: event.event_type,
      status: event.status,
      provider_message_id: event.provider_message_id,
      error_message: event.error_message
    });

    if (error) {
      console.error('Failed to log notification event to Supabase:', error);
    }
  } catch (dbError) {
    console.error('Exception logging notification event:', dbError);
  }
}

/**
 * Orchestrates notifications for a new order.
 * This function handles failures gracefully and guarantees they do not bubble up to crash the order creation flow.
 */
export async function notifyNewOrder(order: OrderPayload) {
  try {
    // 1. Operator Email Notification
    const operatorEmailPromise = sendOperatorEmail(order).then(async (result) => {
      await logNotificationEvent({
        order_id: order.id,
        channel: 'email',
        recipient: 'operator', 
        event_type: 'operator_new_order',
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.providerMessageId,
        error_message: result.error
      });
    });

    // 2. Customer Email Confirmation (if email exists)
    let customerEmailPromise = Promise.resolve();
    if (order.customer_email) {
      customerEmailPromise = sendCustomerEmail(order).then(async (result) => {
        await logNotificationEvent({
          order_id: order.id,
          channel: 'email',
          recipient: order.customer_email as string,
          event_type: 'customer_order_confirmation',
          status: result.success ? 'sent' : 'failed',
          provider_message_id: result.providerMessageId,
          error_message: result.error
        });
      });
    }

    // 3. Operator WhatsApp Notification
    const operatorWhatsappPromise = sendOperatorWhatsApp(order).then(async (result) => {
      if (!result.success && result.error === 'WhatsApp credentials not configured') return;
      
      await logNotificationEvent({
        order_id: order.id,
        channel: 'whatsapp',
        recipient: 'operator',
        event_type: 'operator_new_order',
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.providerMessageId,
        error_message: result.error
      });
    });

    // 4. Customer WhatsApp Confirmation
    const customerWhatsappPromise = sendCustomerWhatsApp(order).then(async (result) => {
      if (!result.success && result.error === 'WhatsApp credentials not configured') return;
      
      await logNotificationEvent({
        order_id: order.id,
        channel: 'whatsapp',
        recipient: order.customer_phone,
        event_type: 'customer_order_confirmation',
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.providerMessageId,
        error_message: result.error
      });
    });

    // Wait for all notifications to attempt finishing
    await Promise.allSettled([
      operatorEmailPromise,
      customerEmailPromise,
      operatorWhatsappPromise,
      customerWhatsappPromise
    ]);

  } catch (error) {
    console.error('Critical failure in notification orchestrator:', error);
  }
}

export async function notifyOrderCompleted(order: OrderPayload) {
  try {
    let customerEmailPromise = Promise.resolve();
    if (order.customer_email) {
      customerEmailPromise = sendCustomerCompletedEmail(order).then(async (result) => {
        await logNotificationEvent({
          order_id: order.id,
          channel: 'email',
          recipient: order.customer_email as string,
          event_type: 'customer_order_completed',
          status: result.success ? 'sent' : 'failed',
          provider_message_id: result.providerMessageId,
          error_message: result.error
        });
      });
    }

    await Promise.allSettled([customerEmailPromise]);
  } catch (error) {
    console.error('Critical failure in order completed notification:', error);
  }
}

