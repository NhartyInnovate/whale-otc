'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatusManager({ orderReference, currentStatus }: { orderReference: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/admin/orders/${orderReference}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const allowedTransitions = (() => {
    if (currentStatus === 'PENDING') return ['COMPLETED', 'CANCELLED'];
    if (currentStatus === 'PROCESSING') return ['COMPLETED', 'CANCELLED'];
    return [];
  })();

  if (allowedTransitions.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-400 text-sm">Order is {currentStatus}. No further transitions allowed.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Update Status</h3>
      
      {error && (
        <div className="text-red-400 text-sm bg-red-950/50 p-2 rounded border border-red-900/50">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allowedTransitions.map((status) => {
          let btnClass = "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700";
          if (status === 'PROCESSING') btnClass = "bg-blue-600 hover:bg-blue-700 text-white border-transparent";
          if (status === 'COMPLETED') btnClass = "bg-green-600 hover:bg-green-700 text-white border-transparent";
          if (status === 'CANCELLED') btnClass = "bg-gray-700 hover:bg-gray-600 text-white border-transparent";

          return (
            <button
              key={status}
              onClick={() => updateStatus(status)}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm hover:shadow ${btnClass}`}
            >
              Mark {status}
            </button>
          );
        })}
      </div>
    </div>
  );
}
