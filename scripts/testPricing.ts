import { generateQuote } from '../src/lib/pricing/quoteEngine';
import { PRICING_CONFIG } from '../src/lib/pricing/pricingConfig';

async function runTests() {
  console.log('--- RUNNING PRICING TESTS ---');
  
  PRICING_CONFIG.buyMarginPercent = 1.25;
  PRICING_CONFIG.sellMarginPercent = 1.25;
  PRICING_CONFIG.buyBufferNgn = 10;
  PRICING_CONFIG.sellBufferNgn = 10;

  // Mock global fetch
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (typeof url === 'string' && url.includes('open.er-api.com')) {
      return {
        ok: true,
        json: async () => ({ rates: { NGN: 1370 } })
      } as unknown as Response;
    }
    if (typeof url === 'string' && url.includes('api.bybit.com/v5/market/tickers')) {
      return {
        ok: true,
        json: async () => ({
          retCode: 0,
          result: {
            list: [{ symbol: 'USDTUSDT', bid1Price: '1', ask1Price: '1', lastPrice: '1' }]
          }
        })
      } as unknown as Response;
    }
    return originalFetch(url);
  };

  try {
    // TEST 1: BUY + NGN
    const buyNgn = await generateQuote({
      side: 'buy',
      asset: 'USDT',
      amount: 150000,
      amountCurrency: 'fiat'
    });
    console.log('BUY (NGN input):', { protectedRate: buyNgn.ngnRate, outputUsdt: buyNgn.outputAmount });
    if (buyNgn.ngnRate !== 1380) throw new Error('BUY+NGN rate failed');

    // TEST 2: BUY + CRYPTO
    const buyCrypto = await generateQuote({
      side: 'buy',
      asset: 'USDT',
      amount: 100,
      amountCurrency: 'crypto'
    });
    console.log('BUY (Crypto input):', { protectedRate: buyCrypto.ngnRate, outputNgn: buyCrypto.outputAmount });
    if (buyCrypto.ngnRate !== 1380) throw new Error('BUY+Crypto rate failed');

    // TEST 3: SELL + CRYPTO
    const sellCrypto = await generateQuote({
      side: 'sell',
      asset: 'USDT',
      amount: 100,
      amountCurrency: 'crypto'
    });
    console.log('SELL (Crypto input):', { protectedRate: sellCrypto.ngnRate, outputNgn: sellCrypto.outputAmount });
    if (sellCrypto.ngnRate !== 1360) throw new Error('SELL+Crypto rate failed');
    
    // TEST 4: SELL + NGN
    const sellNgn = await generateQuote({
      side: 'sell',
      asset: 'USDT',
      amount: 150000,
      amountCurrency: 'fiat'
    });
    console.log('SELL (NGN input):', { protectedRate: sellNgn.ngnRate, outputUsdt: sellNgn.outputAmount });
    if (sellNgn.ngnRate !== 1360) throw new Error('SELL+NGN rate failed');
    
    console.log('ALL TESTS PASSED.');
  } finally {
    global.fetch = originalFetch;
  }
}

runTests().catch(console.error);
