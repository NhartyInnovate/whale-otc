import { verifyAdmin } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ListOrdered, BarChart, Settings } from 'lucide-react';
import LogoutButton from './LogoutButton';

export const metadata = {
  title: 'Whale Command Center',
  description: 'Private operator dashboard',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, user, reason } = await verifyAdmin();

  // Middleware handles unauthenticated redirects, but just in case:
  if (!user) {
    redirect('/admin/login');
  }

  // Handle unauthorized admins (valid session, but email not in allowlist)
  if (!isAuthorized) {
    redirect('/admin/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <span className="text-blue-500">🐋</span> Whale
          </Link>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Command Center</div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={18} />
            Overview
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
            <ListOrdered size={18} />
            Orders
          </Link>
          
          <div className="pt-4 mt-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 cursor-not-allowed">
              <BarChart size={18} />
              Analytics (Soon)
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 cursor-not-allowed">
              <Settings size={18} />
              Settings (Soon)
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-3 mb-3 text-xs text-gray-500 truncate">{user.email}</div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0a0a0a]">
          {children}
        </div>
      </main>
    </div>
  );
}
