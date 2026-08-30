export type TransactionType = 'BUY' | 'SELL';
export type CryptoAsset = 'USDT' | 'SOL';
export type FiatAsset = 'NGN';

export interface QuoteRequest {
  type: TransactionType;
  asset: CryptoAsset;
  amount: string; // The amount entered by the user
  inputCurrency: 'fiat' | 'crypto';
}

export interface QuoteResponse {
  rate: number;
  estimatedReceive: number;
  fiatAmount: number;
  cryptoAmount: number;
  inputAmount: number;
  generatedAt: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  walletAddress?: string; // For BUY
  bankName?: string; // For SELL
  accountNumber?: string; // For SELL
  accountName?: string; // For SELL
}

export interface MarketData {
  asset: string;
  price: number;
  change24h: number;
}
