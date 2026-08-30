import { PRICING_CONFIG } from './pricingConfig';
import { getNgnRates } from './ngnPricing';
import { fetchBybitTickers } from '../market/bybit';

export interface QuoteRequest {
  side: 'buy' | 'sell';
  asset: string;
  amount: number;
  amountCurrency: 'crypto' | 'fiat';
}

export interface QuoteResponse {
  side: 'buy' | 'sell';
  asset: string;
  inputAmount: number;
  inputCurrency: string;
  outputAmount: number;
  outputCurrency: string;
  customerRate: number;
  marketPrice: number;
  marketSide: 'ask' | 'bid' | 'reference';
  ngnRate: number;
  marginPercent: number;
  serviceValueNGN: number;
  generatedAt: number;
}

export async function generateQuote(req: QuoteRequest): Promise<QuoteResponse> {
  // 1. Validate request
  if (!req.amount || req.amount <= 0) {
    throw new Error('Invalid amount');
  }

  // 2 & 3. Fetch current market data and NGN rates
  const ngnData = await getNgnRates();
  
  let marketPrice = 1; // Default for USDT
  let marketSide: 'ask' | 'bid' | 'reference' = 'reference';
  
  if (req.asset !== 'USDT') {
    const cryptoData = await fetchBybitTickers([`${req.asset}USDT`]);
    if (!cryptoData || cryptoData.length === 0) {
      throw new Error(`Crypto market data unavailable for ${req.asset}`);
    }
    const ticker = cryptoData[0];
    
    // 4. Select bid or ask depending on BUY/SELL
    marketPrice = req.side === 'buy' ? ticker.askPrice : ticker.bidPrice;
    marketSide = req.side === 'buy' ? 'ask' : 'bid';
  }

  const ngnReferenceRate = req.side === 'buy' ? ngnData.buyRate : ngnData.sellRate;
  const marginPercent = req.side === 'buy' ? PRICING_CONFIG.buyMarginPercent : PRICING_CONFIG.sellMarginPercent;
  
  // 7. Calculate Minimum Service Value in NGN
  const minimumServiceValueNGN = PRICING_CONFIG.minimumServiceUsd * ngnReferenceRate;

  // Calculate Underlying NGN Value per 1 Crypto
  const underlyingValuePerCrypto = marketPrice * ngnReferenceRate;

  // Enforce Minimum Trade Size
  const estimatedNgnValue = req.amountCurrency === 'fiat' 
    ? req.amount 
    : req.amount * underlyingValuePerCrypto;
    
  if (estimatedNgnValue < PRICING_CONFIG.minimumTradeNgn) {
    throw new Error(`Minimum trade amount is ₦${PRICING_CONFIG.minimumTradeNgn.toLocaleString()}`);
  }

  let outputAmount = 0;
  let effectiveMarginNGN = 0;
  let customerRate = 0;

  // 5, 6, 7. Calculate underlying NGN value, apply margin, and apply minimum service value
  if (req.side === 'buy') {
    // BUY: Customer pays NGN, receives Crypto
    // Whale acquires Crypto at underlyingValuePerCrypto, sells to Customer at a markup
    if (req.amountCurrency === 'fiat') {
      // Input is NGN
      // The total underlying value + margin = req.amount
      // exact percentage margin based on req.amount
      const exactPercentageMargin = req.amount - (req.amount / (1 + marginPercent / 100));
      effectiveMarginNGN = Math.max(exactPercentageMargin, minimumServiceValueNGN);
      
      const underlyingTotalNGN = req.amount - effectiveMarginNGN;
      
      if (underlyingTotalNGN <= 0) {
        throw new Error("Amount too low to cover minimum service fee");
      }
      
      outputAmount = underlyingTotalNGN / underlyingValuePerCrypto;
      customerRate = req.amount / outputAmount;
    } else {
      // Input is Crypto
      const underlyingTotalNGN = req.amount * underlyingValuePerCrypto;
      const percentageMargin = underlyingTotalNGN * (marginPercent / 100);
      effectiveMarginNGN = Math.max(percentageMargin, minimumServiceValueNGN);
      
      outputAmount = underlyingTotalNGN + effectiveMarginNGN;
      customerRate = outputAmount / req.amount;
    }
  } else {
    // SELL: Customer sends Crypto, receives NGN
    // Whale acquires Crypto from Customer at a markdown, sells to Market at underlyingValuePerCrypto
    if (req.amountCurrency === 'crypto') {
      // Input is Crypto
      const underlyingTotalNGN = req.amount * underlyingValuePerCrypto;
      const percentageMargin = underlyingTotalNGN * (marginPercent / 100);
      effectiveMarginNGN = Math.max(percentageMargin, minimumServiceValueNGN);
      
      outputAmount = underlyingTotalNGN - effectiveMarginNGN;
      
      if (outputAmount <= 0) {
        throw new Error("Amount too low to cover minimum service fee");
      }
      
      customerRate = outputAmount / req.amount;
    } else {
      // Input is NGN
      const exactPercentageMargin = (req.amount / (1 - marginPercent / 100)) - req.amount;
      effectiveMarginNGN = Math.max(exactPercentageMargin, minimumServiceValueNGN);
      
      const underlyingTotalNGN = req.amount + effectiveMarginNGN;
      outputAmount = underlyingTotalNGN / underlyingValuePerCrypto; // Crypto needed
      customerRate = req.amount / outputAmount;
    }
  }

  // 8 & 9. Return the final indicative customer quote
  return {
    side: req.side,
    asset: req.asset,
    inputAmount: req.amount,
    inputCurrency: req.amountCurrency === 'fiat' ? 'NGN' : req.asset,
    outputAmount: Number(outputAmount.toFixed(6)),
    outputCurrency: req.amountCurrency === 'fiat' ? req.asset : 'NGN',
    customerRate: Number(customerRate.toFixed(2)),
    marketPrice: marketPrice,
    marketSide: marketSide,
    ngnRate: ngnReferenceRate,
    marginPercent: marginPercent,
    serviceValueNGN: Number(effectiveMarginNGN.toFixed(2)),
    generatedAt: Date.now()
  };
}
