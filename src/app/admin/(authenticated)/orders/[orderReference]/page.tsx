import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusManager from './StatusManager';
import CopyButton from './CopyButton';
import StatusBadge from '../../StatusBadge';

export const revalidate = 0;

export default async function OrderDetailPage({ params }: { params: Promise<{ orderReference: string }> }) {
  const { orderReference } = await params;

  // Fetch Order
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_reference', orderReference)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch Notification Events
  const { data: notifications } = await supabaseAdmin
    .from('notification_events')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });

  // Fetch Order Events (Audit Trail)
  const { data: auditEvents } = await supabaseAdmin
    .from('order_events')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });

  const isBuy = order.side.toUpperCase() === 'BUY';
  const formatNgn = (val: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val).replace('NGN', '₦');
  const formatUsd = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-white transition-colors">
            &larr; Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight break-all">{order.order_reference}</h1>
            <CopyButton text={order.order_reference} />
          </div>
        </div>
        <div>
          <StatusBadge status={order.status} className="px-3 py-1.5 text-xs" />
        </div>
      </div>

      {/* Prominent Status Manager moved to top for instant access */}
      <StatusManager orderReference={order.order_reference} currentStatus={order.status} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Customer</h2>
          <div className="space-y-3">
            <div>
              <p className="text-white font-medium text-lg">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone Number</p>
              <div className="flex items-center justify-between bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                <span className="text-gray-200 font-mono">{order.customer_phone}</span>
                <CopyButton text={order.customer_phone} />
              </div>
            </div>
            {order.customer_email && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                <div className="flex items-center justify-between bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                  <span className="text-gray-200">{order.customer_email}</span>
                  <CopyButton text={order.customer_email} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trade Request */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 flex flex-col justify-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Trade</h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white uppercase">{order.side} {isBuy ? order.output_amount : order.input_amount} {order.asset}</p>
            <p className="text-gray-400 text-lg">Value: <span className="text-white font-medium">{formatNgn(isBuy ? order.input_amount : order.output_amount)}</span></p>
            <p className="text-sm text-gray-500">Rate: {formatNgn(order.customer_rate)} / {order.asset}</p>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Delivery Instructions</h2>
          {isBuy ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Customer&apos;s Wallet Address ({order.wallet_network})</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800 gap-4">
                <span className="text-white font-mono break-all text-sm md:text-base">{order.wallet_address}</span>
                <CopyButton text={order.wallet_address} className="shrink-0" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Bank Name</p>
                <p className="text-white font-medium text-lg">{order.bank_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Account Name</p>
                <p className="text-white font-medium text-lg">{order.bank_account_name}</p>
              </div>
              <div className="sm:col-span-2 space-y-1 mt-2">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Account Number</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800 gap-4">
                  <span className="text-white font-mono text-xl">{order.bank_account_number}</span>
                  <CopyButton text={order.bank_account_number} className="shrink-0" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quote Snapshot */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Quote Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Market Price</p>
              <p className="text-gray-200 font-medium">{formatUsd(order.market_price)}</p>
            </div>
            <div>
              <p className="text-gray-500">NGN Reference</p>
              <p className="text-gray-200 font-medium">{formatNgn(order.ngn_reference_rate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Margin</p>
              <p className="text-gray-200 font-medium">{order.margin_percent}% ({formatNgn(order.percentage_margin_value)})</p>
            </div>
            <div>
              <p className="text-gray-500">Min Service</p>
              <p className="text-gray-200 font-medium">{formatUsd(order.minimum_service_usd)} {order.minimum_service_applied && '(Applied)'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Quoted At</p>
              <p className="text-gray-200">{new Date(order.quote_generated_at).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Expires At</p>
              <p className="text-gray-200">{new Date(order.expires_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Audit & Notifications Combined View for compactness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          {/* Audit Trail */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Audit Trail</h2>
            {auditEvents && auditEvents.length > 0 ? (
              <div className="space-y-4">
                {auditEvents.map((event) => (
                  <div key={event.id} className="text-sm border-l-2 border-gray-700 pl-4 py-1">
                    <p className="text-gray-200 font-medium">
                      {event.event_type}
                      {event.event_type === 'STATUS_CHANGED' && (
                        <span className="text-gray-400 ml-2 font-normal">
                          {event.previous_status} &rarr; <span className="text-white">{event.new_status}</span>
                        </span>
                      )}
                    </p>
                    <div className="flex flex-col mt-1 text-xs text-gray-500">
                      <span>By: {event.actor_email}</span>
                      <span>{new Date(event.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No events.</p>
            )}
          </div>
          
          {/* Notifications */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Notifications</h2>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex justify-between items-start text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-gray-200 font-medium">{String(n.channel).toUpperCase()} - {n.event_type}</p>
                      <p className="text-gray-500 text-xs break-all">{n.recipient}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className={`font-semibold text-xs ${n.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>{String(n.status).toUpperCase()}</p>
                      <p className="text-gray-600 text-[10px]">{new Date(n.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No notifications.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
