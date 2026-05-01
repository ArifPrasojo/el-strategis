import Link from 'next/link';
import { LayoutDashboard, Wallet, Tags, ArrowLeftRight, BarChart3, LogOut, Settings, PieChart, Heart } from 'lucide-react';

const navItems = [
  { name: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
  { name: 'Akun', icon: <Wallet className="w-5 h-5" />, href: '/dashboard/accounts' },
  { name: 'Kategori', icon: <Tags className="w-5 h-5" />, href: '/dashboard/categories' },
  { name: 'Transaksi', icon: <ArrowLeftRight className="w-5 h-5" />, href: '/dashboard/transactions' },
  { name: 'Anggaran', icon: <PieChart className="w-5 h-5" />, href: '/dashboard/budgets' },
  { name: 'Wishlist', icon: <Heart className="w-5 h-5" />, href: '/dashboard/wishlist' },
  { name: 'Laporan', icon: <BarChart3 className="w-5 h-5" />, href: '/dashboard/reports' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex">
      {/* Sidebar — Desktop only */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-neutral-800 bg-neutral-900/30 flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-neutral-950" />
            </div>
            <span className="text-xl font-bold tracking-tight">El Strategis</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-1">
          <Link href="/dashboard/settings" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Pengaturan</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-neutral-950" />
            </div>
            <span className="font-bold tracking-tight">El Strategis</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </header>
        
        <div className="flex-1 p-4 pb-24 md:pb-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 flex justify-around items-center py-2 px-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-neutral-500 hover:text-emerald-400 transition-colors min-w-[48px]"
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
