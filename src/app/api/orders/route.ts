import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateQuote, QuoteRequest } from '@/lib/pricing/quoteEngine';
import { PRICING_CONFIG } from '@/lib/pricing/pricingConfig';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      side, 
      asset, 
      amount, 
      amountCurrency, 
      quoteGeneratedAt,
      idempotencyKey,
      customer,
      delivery,
      payout 
    } = body;

    // 1. Basic validation
    if (!side || !['buy', 'sell'].includes(side)) {
      return NextResponse.json({ success: false, error: 'Invalid side' }, { status: 400 });
    }
    if (!asset || !['SOL', 'USDT'].includes(asset)) {
      return NextResponse.json({ success: false, error: 'Invalid asset' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount) || !isFinite(amount)) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }
    if (!amountCurrency || !['crypto', 'fiat'].includes(amountCurrency)) {
      return NextResponse.json({ success: false, error: 'Invalid currency' }, { status: 400 });
    }
    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ success: false, error: 'Missing customer information' }, { status: 400 });
    }
    if (side === 'buy' && !delivery?.walletAddress) {
      return NextResponse.json({ success: false, error: 'Missing wallet delivery information' }, { status: 400 });
    }
    if (side === 'sell' && (!payout?.bankName || !payout?.accountNumber)) {
      return NextResponse.json({ success: false, error: 'Missing bank payout information' }, { status: 400 });
    }
    if (!idempotencyKey) {
      return NextResponse.json({ success: false, error: 'Missing idempotency key' }, { status: 400 });
    }
    if (!quoteGeneratedAt) {
      return NextResponse.json({ success: false, error: 'Missing quote timestamp' }, { status: 400 });
    }

    // 2. Validate Expiration (60 seconds)
    const QUOTE_VALIDITY_MS = 60 * 1000;
    if (Date.now() - quoteGeneratedAt > QUOTE_VALIDITY_MS) {
      return NextResponse.json({ 
        success: false, 
        error: 'Your quote has expired. Please refresh and try again.',
        code: 'EXPIRED_QUOTE'
      }, { status: 400 });
    }

    // 3. Recalculate Authoritative Quote
    const quoteReq: QuoteRequest = { side, asset, amount, amountCurrency };
    const authoritativeQuote = await generateQuote(quoteReq);

    // 4. Calculate detailed margins
    const minimumServiceValueNgn = PRICING_CONFIG.minimumServiceUsd * authoritativeQuote.ngnRate;
    let percentageMarginValue = 0;
    
    // Reverse engineer the pure percentage margin based on the underlying NGN value
    if (amountCurrency === 'fiat') {
      const underlyingValue = side === 'buy' 
        ? amount / (1 + (authoritativeQuote.marginPercent / 100))
        : amount / (1 - (authoritativeQuote.marginPercent / 100));
      percentageMarginValue = Math.abs(amount - underlyingValue);
    } else {
      const underlyingNgnValue = amount * (authoritativeQuote.marketPrice * authoritativeQuote.ngnRate);
      percentageMarginValue = underlyingNgnValue * (authoritativeQuote.marginPercent / 100);
    }
    
    const minimumServiceApplied = authoritativeQuote.serviceValueNGN >= percentageMarginValue && percentageMarginValue < minimumServiceValueNgn;

    // 5. Check Idempotency (Supabase unique constraint handles race conditions)
    
    // 6. Generate Order Reference
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderReference = `WHL-${dateStr}-${randomStr}`;

    // 7. Store in Supabase and return the full created order
    const { data: createdOrder, error: dbError } = await supabaseAdmin.from('orders').insert({
      order_reference: orderReference,
      side: authoritativeQuote.side,
      asset: authoritativeQuote.asset,
      input_amount: authoritativeQuote.inputAmount,
      input_currency: authoritativeQuote.inputCurrency,
      output_amount: authoritativeQuote.outputAmount,
      output_currency: authoritativeQuote.outputCurrency,
      customer_rate: authoritativeQuote.customerRate,
      market_price: authoritativeQuote.marketPrice,
      market_side: authoritativeQuote.marketSide,
      ngn_reference_rate: authoritativeQuote.ngnRate,
      margin_percent: authoritativeQuote.marginPercent,
      percentage_margin_value: percentageMarginValue,
      minimum_service_usd: PRICING_CONFIG.minimumServiceUsd,
      minimum_service_value_ngn: minimumServiceValueNgn,
      minimum_service_applied: minimumServiceApplied,
      customer_name: customer.name,
      customer_email: customer.email || null,
      customer_phone: customer.phone,
      wallet_address: delivery?.walletAddress || null,
      wallet_network: delivery?.network || null,
      bank_name: payout?.bankName || null,
      bank_account_number: payout?.accountNumber || null,
      bank_account_name: payout?.accountName || null,
      status: 'PENDING',
      idempotency_key: idempotencyKey,
      quote_generated_at: new Date(authoritativeQuote.generatedAt).toISOString(),
      expires_at: new Date(authoritativeQuote.generatedAt + QUOTE_VALIDITY_MS).toISOString()
    }).select().single();

    if (dbError) {
      if (dbError.code === '23505' && dbError.message.includes('idempotency_key')) {
        // ... handled idempotency below

        // Idempotency hit: Fetch existing order
        const { data: existingOrder } = await supabaseAdmin
          .from('orders')
          .select('order_reference, status')
          .eq('idempotency_key', idempotencyKey)
          .single();
          
        if (existingOrder) {
          return NextResponse.json({
            success: true,
            orderReference: existingOrder.order_reference,
            status: existingOrder.status
          });
        }
      }
      console.error('Supabase DB Error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database Error: ' + dbError.message + ' (Hint: Did you run the SQL migration in Supabase?)'
      }, { status: 500 });
    }

    // 8. Trigger Notifications (Fire and forget, resiliently catches its own errors)
    if (createdOrder) {
      // Log ORDER_CREATED to order_events audit trail
      try {
        await supabaseAdmin.from('order_events').insert({
          order_id: createdOrder.id,
          event_type: 'ORDER_CREATED',
          previous_status: null,
          new_status: 'PENDING',
          actor_email: 'CUSTOMER',
        });
      } catch (auditError) {
        console.error('Failed to log ORDER_CREATED audit event:', auditError);
      }

      // Import dynamically to avoid top-level issues, or assume top-level import exists
      const { notifyNewOrder } = await import('@/lib/notifications/notificationService');
      
      // We use `waitUntil` if on Vercel Edge, but for Node runtime Next.js `await` is safest to ensure it runs before process exit,
      // but we don't want it to block the response too long. 
      // Because `notifyNewOrder` catches its own errors, we can safely await it without crashing.
      await notifyNewOrder(createdOrder);
    }

    // 9. Return success
    return NextResponse.json({
      success: true,
      orderReference,
      status: 'PENDING'
    });

  } catch (error: unknown) {
    console.error('Order Submission Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: 'Server Error: ' + errorMessage },
      { status: 500 }
    );
  }
}
