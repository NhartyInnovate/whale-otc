export interface NormalizedMarketData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  bidPrice: number;
  askPrice: number;
  change24h: number;
  timestamp: number;
}
