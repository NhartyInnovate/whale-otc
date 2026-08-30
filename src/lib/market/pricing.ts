import { fetchBybitTickers } from './bybit';
import { NormalizedMarketData } from './types';
import { getRawNgnRate } from '../pricing/ngnPricing';

export async function getLiveMarketData(): Promise<NormalizedMarketData[]> {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const bybitData = await fetchBybitTickers(symbols);
    
    // Fetch live unbuffered reference rate for public display
    const rawNgn = await getRawNgnRate();
    
    const ngnMarket: NormalizedMarketData = {
      symbol: 'USDTNGN',
      baseAsset: 'USDT',
      quoteAsset: 'NGN',
      price: rawNgn.rate,
      bidPrice: rawNgn.rate,
      askPrice: rawNgn.rate,
      change24h: 0.0, // No 24h change data available from fallback currently
      timestamp: rawNgn.timestamp,
    };
    
    // Combine Bybit live data with our NGN reference rate
    return [...bybitData, ngnMarket];
  } catch (error) {
    console.error('Error fetching market data:', error);
    // In case of error, we throw it so the API route can handle graceful degradation
    throw error;
  }
}
