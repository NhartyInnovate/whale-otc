import { NextResponse } from 'next/server';
import { getLiveMarketData } from '@/lib/market/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const marketData = await getLiveMarketData();
    return NextResponse.json({ success: true, data: marketData });
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    // Graceful error handling
    return NextResponse.json(
      { success: false, error: 'Market data temporarily unavailable' },
      { status: 503 }
    );
  }
}
