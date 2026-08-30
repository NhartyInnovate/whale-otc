import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/adminAuth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderReference: string }> }
) {
  try {
    const { orderReference } = await params;

    // 1. Independent Server-Side Authentication & Authorization
    const { isAuthorized, user } = await verifyAdmin();
    
    if (!isAuthorized || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newStatus = body.status;

    if (!['PROCESSING', 'COMPLETED', 'CANCELLED'].includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
    }

    // 2. Fetch current order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_reference', orderReference)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status;

    // 3. Validate Transition
    let validTransition = false;
    if (currentStatus === 'PENDING' && (newStatus === 'COMPLETED' || newStatus === 'CANCELLED')) {
      validTransition = true;
    } else if (currentStatus === 'PROCESSING' && (newStatus === 'COMPLETED' || newStatus === 'CANCELLED')) {
      // Keep this fallback in case any existing orders are stuck in PROCESSING
      validTransition = true;
    }

    if (!validTransition) {
      return NextResponse.json(
        { error: `Invalid transition from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      );
    }

    // 4. Update Order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order update failed:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // 5. Log Audit Event
    const { error: auditError } = await supabaseAdmin
      .from('order_events')
      .insert({
        order_id: order.id,
        event_type: 'STATUS_CHANGED',
        previous_status: currentStatus,
        new_status: newStatus,
        actor_email: user.email,
      });

    if (auditError) {
      console.error('Failed to log audit event:', auditError);
      // We don't fail the request if the audit log fails, but it shouldn't happen.
    }

    // 6. Trigger Notifications (Non-blocking)
    if (newStatus === 'COMPLETED') {
      const fullOrder = { ...order, status: newStatus };
      // Background execution
      import('@/lib/notifications/notificationService').then(({ notifyOrderCompleted }) => {
        notifyOrderCompleted(fullOrder);
      });
    }

    return NextResponse.json({ success: true, status: newStatus });

  } catch (error: unknown) {
    console.error('Admin status update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
