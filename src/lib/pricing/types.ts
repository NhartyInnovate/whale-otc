export interface NgnRates {
  buyRate: number; // The NGN rate used when customer BUYS crypto (Whale acquires NGN)
  sellRate: number; // The NGN rate used when customer SELLS crypto (Whale sells NGN)
  timestamp: number;
  source?: string;
}

export interface QuoteResponse {
  rate: number;
  estimatedReceive: number;
  fiatAmount: number;
  cryptoAmount: number;
  // Raw fields required for authoritative snapshot
  customerRate: number;
  outputAmount: number;
  marketPrice: number;
  marketSide: 'bid' | 'ask';
  ngnReferenceRate: number;
  marginPercent: number;
  percentageMarginValueNgn: number;
  minimumServiceUsd: number;
  minimumServiceValueNgn: number;
  minimumServiceApplied: boolean;
  generatedAt: number;
}

export interface QuoteEngineConfig {
  buyMarginPercent: number;
  sellMarginPercent: number;
  minimumServiceUsd: number;
  minimumTradeNgn: number;
  buyBufferNgn: number; // Flat NGN addition to protect Whale when acquiring crypto
  sellBufferNgn: number; // Flat NGN subtraction to protect Whale when liquidating crypto
}
