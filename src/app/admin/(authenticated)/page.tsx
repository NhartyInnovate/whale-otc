import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0; // Ensure fresh data on every request

export default async function AdminDashboard() {
  const { data: allOrders } = await supabaseAdmin
    .from('orders')
    .select('status, created_at, side, input_amount, output_amount, percentage_margin_value, order_reference, asset, customer_name')
    .order('created_at', { ascending: false });

  const orders = allOrders || [];

  let pending = 0;
  let processing = 0;
  let completed = 0;
  let cancelled = 0;

  let todaysOrders = 0;
  let todaysVolumeNgn = 0;
  let todaysMarginNgn = 0;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  orders.forEach((order) => {
    // Status counts
    if (order.status === 'PENDING') pending++;
    else if (order.status === 'PROCESSING') processing++;
    else if (order.status === 'COMPLETED') completed++;
    else if (order.status === 'CANCELLED') cancelled++;

    // Today's metrics
    const orderTime = new Date(order.created_at).getTime();
    if (orderTime >= startOfToday) {
      todaysOrders++;
      todaysMarginNgn += Number(order.percentage_margin_value || 0);
      
      // Volume in NGN
      if (order.side === 'buy') {
        todaysVolumeNgn += Number(order.input_amount || 0);
      } else {
        todaysVolumeNgn += Number(order.output_amount || 0);
      }
    }
  });

  const formatNgn = (val: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val).replace('NGN', '₦');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="PENDING" value={pending} color="text-yellow-500" />
        <StatCard title="PROCESSING" value={processing} color="text-blue-500" />
        <StatCard title="COMPLETED" value={completed} color="text-green-500" />
        <StatCard title="CANCELLED" value={cancelled} color="text-gray-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Today&apos;s Orders</h3>
          <p className="text-3xl font-bold text-white">{todaysOrders}</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Today&apos;s Trading Volume</h3>
          <p className="text-3xl font-bold text-white">{formatNgn(todaysVolumeNgn)}</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Today&apos;s Gross Margin</h3>
          <p className="text-3xl font-bold text-green-400">{formatNgn(todaysMarginNgn)}</p>
          <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
            Estimated
          </div>
        </div>
      </div>

      {/* Pending Orders Feed */}
      <div className="pt-8">
        <h2 className="text-lg font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          Action Required: Pending Orders
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.filter(o => o.status === 'PENDING').length === 0 ? (
            <div className="col-span-full p-8 border border-dashed border-gray-800 rounded-2xl text-center text-gray-500 text-sm">
              You&apos;re all caught up! No pending orders.
            </div>
          ) : (
            orders.filter(o => o.status === 'PENDING').slice(0, 9).map(order => {
              const isBuy = order.side.toUpperCase() === 'BUY';
              const ngnValue = isBuy ? order.input_amount : order.output_amount;
              const cryptoValue = isBuy ? order.output_amount : order.input_amount;
              
              return (
                <a 
                  key={order.order_reference} 
                  href={`/admin/orders/${order.order_reference}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-yellow-500/50 p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-gray-200 text-sm">{order.order_reference}</span>
                    <span className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {order.side}
                    </span>
                    <span className="text-gray-300 font-medium text-lg">
                      {cryptoValue} {order.asset}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm mb-4">
                    {formatNgn(ngnValue)}
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-800">
                    <span className="text-gray-400 truncate pr-2">{order.customer_name}</span>
                    <span className="text-yellow-500 font-medium group-hover:underline">Process &rarr;</span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
      <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
