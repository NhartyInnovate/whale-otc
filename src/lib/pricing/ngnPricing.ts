import { NgnRates } from './types';
import crypto from 'crypto';
import { PRICING_CONFIG } from './pricingConfig';

async function fetchBybitConvertRate(fromCoin: string, toCoin: string): Promise<number> {
  const apiKey = process.env.BYBIT_API_KEY;
  const apiSecret = process.env.BYBIT_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Bybit API credentials not found');
  }

  const timestamp = Date.now().toString();
  const recvWindow = '5000';
  const bodyObj = {
    fromCoin,
    toCoin,
    requestCoin: fromCoin,
    requestAmount: '10', // Requesting for 10 USDT to get a realistic rate
    accountType: 'FUND'
  };
  const bodyStr = JSON.stringify(bodyObj);
  
  const stringToSign = timestamp + apiKey + recvWindow + bodyStr;
  const signature = crypto.createHmac('sha256', apiSecret).update(stringToSign).digest('hex');

  const res = await fetch('https://api.bybit.com/v5/asset/exchange/quote-apply', {
    method: 'POST',
    headers: {
      'X-BAPI-API-KEY': apiKey,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': recvWindow,
      'Content-Type': 'application/json'
    },
    body: bodyStr,
  });

  if (!res.ok) {
    throw new Error(`Bybit Convert HTTP Error: ${res.status}`);
  }

  const data = await res.json();
  if (data.retCode !== 0) {
    throw new Error(`Bybit Convert API Error: ${data.retMsg}`);
  }

  if (!data.result || !data.result.exchangeRate) {
    throw new Error('Bybit Convert response missing exchange rate');
  }

  return parseFloat(data.result.exchangeRate);
}

export async function getRawNgnRate(): Promise<{ rate: number; timestamp: number; source: string }> {
  let baseRate = 0;
  let source = '';
  
  try {
    if (process.env.BYBIT_API_KEY) {
      baseRate = await fetchBybitConvertRate('USDT', 'NGN');
      source = 'bybit_convert_auth';
    }
  } catch (error) {
    console.error('Authenticated Bybit NGN fetch failed:', error);
  }

  if (baseRate === 0) {
    try {
      const openRes = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 60 } });
      if (openRes.ok) {
        const openData = await openRes.json();
        if (openData.rates && openData.rates.NGN) {
          baseRate = parseFloat(openData.rates.NGN);
          source = 'open_er_api_fallback';
        }
      }
    } catch (error) {
      console.error('Fallback NGN provider failed:', error);
    }
  }

  if (baseRate === 0) {
    throw new Error("NGN reference rate temporarily unavailable");
  }

  return { rate: baseRate, timestamp: Date.now(), source };
}

/**
 * Fetches the NGN/USDT Convert reference rate from Bybit, with a directional P2P buffer offset applied.
 * This is the primary function used by the Quote Engine.
 */
export async function getNgnRates(): Promise<NgnRates> {
  const { rate: baseRate, timestamp, source } = await getRawNgnRate();
  
  // Apply the directional P2P buffers
  const protectedBuyRate = baseRate + PRICING_CONFIG.buyBufferNgn;
  const protectedSellRate = baseRate - PRICING_CONFIG.sellBufferNgn;
  
  return { 
    buyRate: protectedBuyRate, 
    sellRate: protectedSellRate, 
    timestamp, 
    source 
  };
}
