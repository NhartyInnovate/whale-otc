import { NextResponse } from 'next/server';
import { generateQuote, QuoteRequest } from '@/lib/pricing/quoteEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { side, asset, amount, amountCurrency } = body;

    if (!side || !['buy', 'sell'].includes(side)) {
      return NextResponse.json({ success: false, error: 'Invalid side' }, { status: 400 });
    }
    if (!asset || !['SOL', 'USDT'].includes(asset)) {
      return NextResponse.json({ success: false, error: 'Invalid asset' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }
    if (!amountCurrency || !['crypto', 'fiat'].includes(amountCurrency)) {
      return NextResponse.json({ success: false, error: 'Invalid currency' }, { status: 400 });
    }

    const quoteReq: QuoteRequest = { side, asset, amount, amountCurrency };
    const quote = await generateQuote(quoteReq);

    return NextResponse.json({ success: true, data: quote });
  } catch (error: unknown) {
    console.error('Quote engine error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Quote temporarily unavailable';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 503 }
    );
  }
}
