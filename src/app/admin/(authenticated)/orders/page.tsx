import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import StatusBadge from '../StatusBadge';

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  // Default to PENDING instead of ALL for operational efficiency
  const statusFilter = params.status || 'PENDING';
  const sideFilter = params.side || 'ALL';
  const assetFilter = params.asset || 'ALL';
  const searchStr = params.search?.toLowerCase() || '';

  let query = supabaseAdmin
    .from('orders')
    .select('order_reference, side, asset, input_amount, output_amount, customer_name, status, created_at, customer_email, customer_phone')
    .order('created_at', { ascending: false });

  if (statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter);
  }
  if (sideFilter !== 'ALL') {
    query = query.eq('side', sideFilter.toLowerCase());
  }
  if (assetFilter !== 'ALL') {
    query = query.eq('asset', assetFilter);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Failed to fetch orders:', error);
  }

  const filteredOrders = (orders || []).filter((order) => {
    if (!searchStr) return true;
    return (
      order.order_reference.toLowerCase().includes(searchStr) ||
      order.customer_name.toLowerCase().includes(searchStr) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchStr)) ||
      order.customer_phone.toLowerCase().includes(searchStr)
    );
  });

  const formatNgn = (val: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val).replace('NGN', '₦');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
        
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === s ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-gray-800">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders found matching the criteria.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isBuy = order.side.toUpperCase() === 'BUY';
              const ngnValue = isBuy ? order.input_amount : order.output_amount;
              const cryptoValue = isBuy ? order.output_amount : order.input_amount;

              return (
                <Link key={order.order_reference} href={`/admin/orders/${order.order_reference}`} className="block p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-200 text-sm">{order.order_reference}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {order.side}
                      </span>
                      <span className="text-gray-300 font-medium text-sm">
                        {cryptoValue} {order.asset}
                      </span>
                    </div>
                    <div className="text-gray-300 font-medium text-sm">
                      {formatNgn(ngnValue)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end text-xs text-gray-500">
                    <div>
                      <div className="text-gray-300">{order.customer_name}</div>
                      <div>{order.customer_phone}</div>
                    </div>
                    <div>{new Date(order.created_at).toLocaleDateString('en-NG')}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500 bg-gray-950/50">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Trade</th>
                <th className="p-4 font-medium">Value (NGN)</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isBuy = order.side.toUpperCase() === 'BUY';
                  const ngnValue = isBuy ? order.input_amount : order.output_amount;
                  const cryptoValue = isBuy ? order.output_amount : order.input_amount;

                  return (
                    <tr key={order.order_reference} className="hover:bg-gray-800/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-gray-200">{order.order_reference}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {order.side}
                          </span>
                          <span className="text-gray-300 font-medium">
                            {cryptoValue} {order.asset}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">
                        {formatNgn(ngnValue)}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-200">{order.customer_name}</div>
                        <div className="text-gray-500 text-xs">{order.customer_phone}</div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-NG')}
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/admin/orders/${order.order_reference}`}
                          className="text-white bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 transition-colors"
                        >
                          Process &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
