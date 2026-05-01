import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    };
  });

  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: months[0].start, lte: months[5].end } },
    include: { category: true }
  });

  const monthlyData = months.map(m => {
    const tx = allTransactions.filter(t => t.date >= m.start && t.date <= m.end);
    const income = tx.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
    const expense = tx.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0);
    return { label: m.label, income, expense, net: income - expense };
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const currentMonthTx = allTransactions.filter(t => t.date >= startOfMonth && t.date <= endOfMonth);

  const expenseByCategory = currentMonthTx
    .filter(t => t.type === 'EXPENSE' && t.category)
    .reduce((acc, t) => { acc[t.category!.name] = (acc[t.category!.name] || 0) + t.amount; return acc; }, {} as Record<string, number>);

  const totalExpenses = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
  const totalIncome = currentMonthTx.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  const categoryBreakdown = Object.entries(expenseByCategory)
    .map(([name, amount]) => ({ name, amount, pct: totalExpenses ? (amount / totalExpenses) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  const maxBarValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 1);
  const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Laporan</h1>
        <p className="text-sm text-neutral-400">Analisis performa keuangan Anda selama 6 bulan terakhir.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Pemasukan Bulan Ini', value: fmt(totalIncome), icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
          { label: 'Pengeluaran Bulan Ini', value: fmt(totalExpenses), icon: <ArrowDownRight className="w-5 h-5 text-red-500" />, bg: 'bg-red-500/10', color: 'text-neutral-200' },
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
        {/* 6-Month Bar Chart */}
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-base md:text-lg font-semibold mb-4">Pemasukan vs Pengeluaran (6 Bulan)</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full h-32">
                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-emerald-500/70 rounded-t-sm transition-all duration-700" style={{ height: `${(m.income / maxBarValue) * 100}%`, minHeight: m.income > 0 ? '3px' : '0' }} title={`Pemasukan: ${fmt(m.income)}`} />
                  </div>
                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-red-500/70 rounded-t-sm transition-all duration-700" style={{ height: `${(m.expense / maxBarValue) * 100}%`, minHeight: m.expense > 0 ? '3px' : '0' }} title={`Pengeluaran: ${fmt(m.expense)}`} />
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-500/70 inline-block" /> Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-500/70 inline-block" /> Pengeluaran</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h2 className="text-base md:text-lg font-semibold mb-4">Rincian Pengeluaran (Bulan Ini)</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-neutral-500">
              <BarChart3 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Belum ada data pengeluaran</p>
            </div>
          ) : (
            <div className="space-y-4">
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

      {/* Monthly Table */}
      <div className="p-4 md:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
        <h2 className="text-base md:text-lg font-semibold mb-4">Tabel Ringkasan Bulanan</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-800">
                <th className="pb-3 px-2 font-medium">Bulan</th>
                <th className="pb-3 px-2 font-medium text-right">Pemasukan</th>
                <th className="pb-3 px-2 font-medium text-right">Pengeluaran</th>
                <th className="pb-3 px-2 font-medium text-right">Tabungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {monthlyData.map((row, i) => (
                <tr key={i} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 px-2 text-neutral-300">{row.label}</td>
                  <td className="py-3 px-2 text-right text-emerald-400">{fmt(row.income)}</td>
                  <td className="py-3 px-2 text-right text-neutral-300">{fmt(row.expense)}</td>
                  <td className={`py-3 px-2 text-right font-medium ${row.net >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
