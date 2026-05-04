import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolvedParams = await searchParams;
  const monthParam = resolvedParams.month;

  const now = new Date();
  let selectedDate = new Date(now.getFullYear(), now.getMonth(), 1);
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split('-');
    selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  }

  const prevMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  
  // We can prevent navigating to future months if we want, but letting them go up to current month is fine
  const isCurrentMonth = selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();

  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const selectedMonthLabel = selectedDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
  const daysInMonth = endOfMonth.getDate();

  // Fetch ALL transactions for the monthly history table (just amount, type, date)
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    select: { amount: true, type: true, date: true, category: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  // Filter for selected month
  const currentMonthTx = allTransactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);

  // Daily Data for Chart
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const tx = currentMonthTx.filter(t => t.date.getDate() === day);
    const income = tx.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
    const expense = tx.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
    return { day, income, expense };
  });

  const totalIncome = currentMonthTx.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Category Breakdown
  const expenseByCategory = currentMonthTx
    .filter(t => t.type === 'EXPENSE' && t.category)
    .reduce((acc, t) => { acc[t.category!.name] = (acc[t.category!.name] || 0) + t.amount; return acc; }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(expenseByCategory)
    .map(([name, amount]) => ({ name, amount, pct: totalExpenses ? (amount / totalExpenses) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly History Grouping
  const monthlyHistoryObj = allTransactions.reduce((acc, t) => {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { label: t.date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }), income: 0, expense: 0, key };
    if (t.type === 'INCOME') acc[key].income += t.amount;
    if (t.type === 'EXPENSE') acc[key].expense += t.amount;
    return acc;
  }, {} as Record<string, { label: string, income: number, expense: number, key: string }>);

  const monthlyHistory = Object.values(monthlyHistoryObj).sort((a, b) => b.key.localeCompare(a.key));

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  const maxBarValue = Math.max(...dailyData.map(d => Math.max(d.income, d.expense)), 1);
  const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Laporan Bulanan</h1>
        <p className="text-sm text-neutral-400">Analisis performa keuangan Anda secara mendetail setiap bulannya.</p>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-neutral-900/50 border border-neutral-800 p-2 rounded-2xl">
        <Link href={`/dashboard/reports?month=${prevMonthStr}`} className="p-3 bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:text-emerald-400 rounded-xl transition-all">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-lg">{selectedMonthLabel}</span>
        {isCurrentMonth ? (
          <div className="p-3 bg-neutral-950 border border-neutral-800 opacity-30 rounded-xl cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </div>
        ) : (
          <Link href={`/dashboard/reports?month=${nextMonthStr}`} className="p-3 bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:text-emerald-400 rounded-xl transition-all">
            <ChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Pemasukan', value: fmt(totalIncome), icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
          { label: 'Pengeluaran', value: fmt(totalExpenses), icon: <ArrowDownRight className="w-5 h-5 text-red-500" />, bg: 'bg-red-500/10', color: 'text-neutral-200' },
          {
            label: 'Tabungan Bersih', value: fmt(netSavings),
            icon: netSavings >= 0 ? <TrendingUp className="w-5 h-5 text-blue-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />,
            bg: netSavings >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10',
            color: netSavings >= 0 ? 'text-blue-400' : 'text-red-400'
          },
        ].map((c) => (
          <div key={c.label} className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center`}>{c.icon}</div>
              <span className="text-sm text-neutral-400">{c.label}</span>
            </div>
            <div className={`text-xl md:text-2xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Daily Bar Chart (Scrollable) */}
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col">
          <h2 className="text-base md:text-lg font-semibold mb-4">Grafik Harian ({selectedMonthLabel})</h2>
          
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex items-end gap-1.5 h-48 min-w-[600px] px-2 pt-10">
              {dailyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-xs p-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-xl border border-neutral-700">
                    <div className="font-bold mb-1">Tgl {d.day}</div>
                    <div className="text-emerald-400">In: {fmt(d.income)}</div>
                    <div className="text-red-400">Out: {fmt(d.expense)}</div>
                  </div>
                  
                  <div className="flex items-end gap-[1px] w-full h-36 bg-neutral-950/30 rounded-t-sm">
                    <div className="flex-1 flex items-end justify-center">
                      <div className="w-full max-w-[12px] bg-emerald-500/70 rounded-t-sm transition-all duration-300 hover:bg-emerald-400" style={{ height: `${(d.income / maxBarValue) * 100}%`, minHeight: d.income > 0 ? '4px' : '0' }} />
                    </div>
                    <div className="flex-1 flex items-end justify-center">
                      <div className="w-full max-w-[12px] bg-red-500/70 rounded-t-sm transition-all duration-300 hover:bg-red-400" style={{ height: `${(d.expense / maxBarValue) * 100}%`, minHeight: d.expense > 0 ? '4px' : '0' }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-500/70 inline-block" /> Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-500/70 inline-block" /> Pengeluaran</span>
            <span className="ml-auto italic text-[10px]">Geser untuk melihat semua tanggal &rarr;</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-base md:text-lg font-semibold mb-4">Rincian Pengeluaran</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
              <BarChart3 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Belum ada pengeluaran bulan ini</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-neutral-300 truncate">{cat.name}</span>
                    <span className="text-neutral-400 shrink-0 ml-2">{cat.pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${COLORS[i % COLORS.length]} rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly History Table */}
      <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h2 className="text-base md:text-lg font-semibold mb-4">Riwayat Setiap Bulan</h2>
        {monthlyHistory.length === 0 ? (
           <p className="text-sm text-neutral-500 text-center py-6">Belum ada data riwayat bulan sebelumnya.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-800">
                  <th className="pb-3 px-4 font-medium">Bulan</th>
                  <th className="pb-3 px-4 font-medium text-right">Pemasukan</th>
                  <th className="pb-3 px-4 font-medium text-right">Pengeluaran</th>
                  <th className="pb-3 px-4 font-medium text-right">Tabungan Bersih</th>
                  <th className="pb-3 px-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {monthlyHistory.map((row) => {
                  const net = row.income - row.expense;
                  const isRowSelected = row.key === monthParam || (isCurrentMonth && row.key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                  
                  return (
                    <tr key={row.key} className={`hover:bg-neutral-800/30 transition-colors ${isRowSelected ? 'bg-neutral-800/20' : ''}`}>
                      <td className="py-4 px-4 text-neutral-300 font-medium">
                        {row.label}
                        {isRowSelected && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Aktif</span>}
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-400">{fmt(row.income)}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{fmt(row.expense)}</td>
                      <td className={`py-4 px-4 text-right font-medium ${net >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(net)}</td>
                      <td className="py-4 px-4 text-center">
                        <Link href={`/dashboard/reports?month=${row.key}`} className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors inline-block">
                          Lihat Laporan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
