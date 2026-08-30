import { Clock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  let colorClass = 'bg-gray-800 text-gray-400 border border-gray-700';
  let Icon = Clock;
  const label = status;

  if (status === 'PENDING') {
    colorClass = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
    Icon = Clock;
  } else if (status === 'PROCESSING') {
    colorClass = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    Icon = RefreshCw;
  } else if (status === 'COMPLETED') {
    colorClass = 'bg-green-500/10 text-green-500 border border-green-500/20';
    Icon = CheckCircle2;
  } else if (status === 'CANCELLED') {
    colorClass = 'bg-gray-800 text-gray-500 border border-gray-700';
    Icon = XCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-widest ${colorClass} ${className}`}>
      <Icon size={12} className={status === 'PROCESSING' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
}
