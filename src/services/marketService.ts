import { QuoteRequest, QuoteResponse } from '../types';
import { NormalizedMarketData } from '../lib/market/types';
import { QuoteResponse as BackendQuoteResponse } from '../lib/pricing/quoteEngine';

export const marketService = {
  getQuote: async (request: QuoteRequest): Promise<QuoteResponse> => {
    // request.asset is 'USDT' or 'SOL'
    // request.type is 'BUY' or 'SELL'
    // request.amount is a string, needs parsing
    const amountNum = parseFloat(request.amount) || 0;
    if (amountNum <= 0) {
      return { rate: 0, estimatedReceive: 0, fiatAmount: 0, cryptoAmount: 0, inputAmount: 0, generatedAt: 0 };
    }

    const side = request.type.toLowerCase() as 'buy' | 'sell';
    const amountCurrency = request.inputCurrency;

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        side,
        asset: request.asset,
        amount: amountNum,
        amountCurrency
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Quote temporarily unavailable');
    }

    const data: BackendQuoteResponse = json.data;

    return {
      rate: data.customerRate,
      estimatedReceive: data.outputAmount,
      fiatAmount: request.inputCurrency === 'fiat' ? amountNum : data.outputAmount,
      cryptoAmount: request.inputCurrency === 'crypto' ? amountNum : data.outputAmount,
      inputAmount: data.inputAmount,
      generatedAt: data.generatedAt,
    };
  },

  getLiveMarket: async (): Promise<NormalizedMarketData[]> => {
    const res = await fetch('/api/market');
    const json = await res.json();
    
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch market data');
    }
    
    return json.data;
  }
};
