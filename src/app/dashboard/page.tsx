import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, Heart } from 'lucide-react';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const accounts = await prisma.account.findMany({ where: { userId: user.id } });
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const currentMonthTx = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } }
  });

  const incomeThisMonth = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expensesThisMonth = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id, startDate: { lte: now }, endDate: { gte: now } },
    include: { category: true }
  });
  const budgetsWithSpent = budgets.map(b => {
    const spent = currentMonthTx.filter(t => t.categoryId === b.categoryId && t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    return { ...b, spent };
  });
  const nearLimitCount = budgetsWithSpent.filter(b => b.spent >= b.amount * 0.8).length;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true, account: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: Date) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Ringkasan</h1>
        <p className="text-sm text-neutral-400">Selamat datang! Berikut ringkasan keuangan Anda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Saldo', value: fmt(totalBalance), icon: <Wallet className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10', sub: '' },
          { label: 'Pemasukan', value: fmt(incomeThisMonth), icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10', sub: 'Bulan ini' },
          { label: 'Pengeluaran', value: fmt(expensesThisMonth), icon: <ArrowDownRight className="w-4 h-4 text-red-500" />, bg: 'bg-red-500/10', sub: 'Bulan ini' },
          { label: 'Anggaran Aktif', value: String(budgets.length), icon: <CreditCard className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-500/10', sub: `${nearLimitCount} hampir habis` },
        ].map((card) => (
          <div key={card.label} className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400">{card.label}</h3>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${card.bg} flex items-center justify-center`}>{card.icon}</div>
            </div>
            <div className="text-lg md:text-2xl font-bold truncate">{card.value}</div>
            {card.sub && <div className="text-xs text-neutral-500 mt-1">{card.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-base md:text-lg font-semibold mb-4">Transaksi Terbaru</h2>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-500">Belum ada transaksi. Tambahkan transaksi pertama Anda!</div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-neutral-800/50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{tx.description || tx.category?.name || 'Tanpa Kategori'}</div>
                        <div className="text-xs text-neutral-500 truncate">{tx.account.name} • {fmtDate(tx.date)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ml-2 shrink-0 ${isIncome ? 'text-emerald-400' : 'text-neutral-200'}`}>
                      {isIncome ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Overview */}
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-base md:text-lg font-semibold mb-4">Ringkasan Anggaran</h2>
          {budgetsWithSpent.length === 0 ? (
            <div className="text-center py-10 text-sm text-neutral-500">Belum ada anggaran aktif.</div>
          ) : (
            <div className="space-y-5">
              {budgetsWithSpent.map((b) => {
                const pct = Math.min((b.spent / b.amount) * 100, 100);
                const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-emerald-500';
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{b.category.name}</span>
                      <span className="text-neutral-400 shrink-0 ml-2">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{fmt(b.spent)}</span>
                      <span>{fmt(b.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Summary */}
      {wishlist.length > 0 && (
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base md:text-lg font-semibold">Progres Wishlist</h2>
            <Link href="/dashboard/wishlist" className="text-sm text-pink-500 hover:text-pink-400 font-medium">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const pct = Math.min((item.savedAmount / item.targetAmount) * 100, 100);
              return (
                <div key={item.id} className="space-y-3 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm truncate pr-2">{item.name}</div>
                    <div className="text-xs font-bold text-pink-500 shrink-0">{pct.toFixed(0)}%</div>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>{fmt(item.savedAmount)}</span>
                    <span>{fmt(item.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
