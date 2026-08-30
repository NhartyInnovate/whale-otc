import { OrderPayload, NotificationResult } from './types';
import twilio from 'twilio';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

// Environment variables for Twilio WhatsApp integration
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const operatorWhatsApp = process.env.WHALE_OPERATOR_WHATSAPP;

const twilioOperatorContentSid = process.env.TWILIO_OPERATOR_CONTENT_SID;
const twilioCustomerContentSid = process.env.TWILIO_CUSTOMER_CONTENT_SID;

// Initialize Twilio client lazily to avoid crashing on boot if env vars are missing
let twilioClient: twilio.Twilio | null = null;
if (twilioAccountSid && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
}

/**
 * Normalizes a phone number to standard E.164 digits-only format required by WhatsApp.
 * e.g., "08012345678" -> "2348012345678"
 */
export function normalizePhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;
  
  let digits = phone.replace(/\D/g, '');
  
  // Assume Nigerian number if 11 digits starting with 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = '234' + digits.substring(1);
  }
  
  // Valid international numbers are usually 10-15 digits
  if (digits.length >= 10 && digits.length <= 15) {
    return digits;
  }
  
  return null;
}

const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency === 'NGN' ? 'NGN' : 'USD' }).format(amount).replace('$', currency === 'NGN' ? '₦' : '$');
};

/**
 * Sends the Operator notification using Twilio WhatsApp API.
 */
export async function sendOperatorWhatsApp(order: OrderPayload): Promise<NotificationResult> {
  if (!twilioClient || !twilioWhatsappFrom || !operatorWhatsApp) {
    return { success: false, channel: 'whatsapp', error: 'Twilio credentials not configured' };
  }

  const normalizedOperatorNumber = normalizePhoneNumber(operatorWhatsApp);
  if (!normalizedOperatorNumber) {
    return { success: false, channel: 'whatsapp', error: 'Invalid operator phone number' };
  }

  const isBuy = order.side.toUpperCase() === 'BUY';
  const cryptoAmount = `${isBuy ? order.output_amount : order.input_amount} ${order.asset}`;
  const fiatAmount = formatMoney(isBuy ? order.input_amount : order.output_amount, 'NGN');

  const messageBody = `🔔 WHALE — NEW ORDER

Order: ${order.order_reference}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Type: ${order.side.toUpperCase()}
Amount: ${cryptoAmount}
Customer receives: ${fiatAmount}
Status: ${order.status.toUpperCase()}

Please review and process this order.`;

  try {
    const messageOpts: MessageListInstanceCreateOptions = {
      from: `whatsapp:${twilioWhatsappFrom.replace('whatsapp:', '')}`,
      to: `whatsapp:+${normalizedOperatorNumber}`
    };

    if (twilioOperatorContentSid) {
      messageOpts.contentSid = twilioOperatorContentSid;
      messageOpts.contentVariables = JSON.stringify({
        "1": order.order_reference,
        "2": order.customer_name,
        "3": order.customer_phone,
        "4": order.side.toUpperCase(),
        "5": cryptoAmount,
        "6": fiatAmount,
        "7": order.status.toUpperCase()
      });
    } else {
      messageOpts.body = messageBody;
    }

    const message = await twilioClient.messages.create(messageOpts);
    
    return { success: true, channel: 'whatsapp', providerMessageId: message.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Operator WhatsApp failed:', errorMessage);
    return { success: false, channel: 'whatsapp', error: errorMessage };
  }
}

/**
 * Sends the Customer confirmation using Twilio WhatsApp API.
 */
export async function sendCustomerWhatsApp(order: OrderPayload): Promise<NotificationResult> {
  if (!twilioClient || !twilioWhatsappFrom) {
    return { success: false, channel: 'whatsapp', error: 'Twilio credentials not configured' };
  }

  const normalizedCustomerNumber = normalizePhoneNumber(order.customer_phone);
  if (!normalizedCustomerNumber) {
    return { success: false, channel: 'whatsapp', error: 'Could not normalize customer phone number' };
  }

  const isBuy = order.side.toUpperCase() === 'BUY';
  const cryptoAmount = `${isBuy ? order.output_amount : order.input_amount} ${order.asset}`;
  const fiatAmount = formatMoney(isBuy ? order.input_amount : order.output_amount, 'NGN');

  const messageBody = `🐋 WHALE — Order Confirmed

Your order ${order.order_reference} has been received successfully.

Order type: ${order.side.toUpperCase()}
Amount: ${cryptoAmount}
Customer receives: ${fiatAmount}
Status: ${order.status.toUpperCase()}

Thank you for choosing Whale.`;

  try {
    const messageOpts: MessageListInstanceCreateOptions = {
      from: `whatsapp:${twilioWhatsappFrom.replace('whatsapp:', '')}`,
      to: `whatsapp:+${normalizedCustomerNumber}`
    };

    if (twilioCustomerContentSid) {
      messageOpts.contentSid = twilioCustomerContentSid;
      messageOpts.contentVariables = JSON.stringify({
        "1": order.order_reference,
        "2": order.side.toUpperCase(),
        "3": cryptoAmount,
        "4": fiatAmount,
        "5": order.status.toUpperCase()
      });
    } else {
      messageOpts.body = messageBody;
    }

    const message = await twilioClient.messages.create(messageOpts);
    
    return { success: true, channel: 'whatsapp', providerMessageId: message.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Customer WhatsApp failed:', errorMessage);
    return { success: false, channel: 'whatsapp', error: errorMessage };
  }
}
