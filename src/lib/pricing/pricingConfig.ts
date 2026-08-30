import { QuoteEngineConfig } from './types';

// These configurations should eventually be moved to a database or environment variables
export const PRICING_CONFIG: QuoteEngineConfig = {
  buyMarginPercent: 1.25,
  sellMarginPercent: 1.25,
  minimumServiceUsd: 1.00,
  minimumTradeNgn: 12000,
  buyBufferNgn: 10,
  sellBufferNgn: 10,
};
