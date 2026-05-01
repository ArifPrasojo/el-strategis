'use client';

import { useState } from 'react';
import { deleteBudget } from './actions';
import { Trash2, PieChart, Loader2, AlertTriangle } from 'lucide-react';
import { Budget, Category } from '@prisma/client';

type BudgetWithRelations = Budget & { category: Category; spent: number; };

export default function BudgetList({ budgets }: { budgets: BudgetWithRelations[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus anggaran ini?')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteBudget(formData);
    setDeletingId(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (budgets.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <PieChart className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-xl font-medium text-neutral-300 mb-2">Belum ada anggaran</h3>
        <p className="text-neutral-500">Tetapkan batas pengeluaran untuk kategori Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
        const remaining = budget.amount - budget.spent;
        const isDanger = percentage >= 100;
        const isWarning = percentage >= 80 && !isDanger;
        const barColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500';
        const textColor = isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-emerald-400';

        return (
          <div key={budget.id} className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-neutral-200">{budget.category.name}</h3>
                  {(isDanger || isWarning) && (
                    <AlertTriangle className={`w-4 h-4 ${isDanger ? 'text-red-400' : 'text-orange-400'}`} />
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5" suppressHydrationWarning>
                  {new Date(budget.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – {new Date(budget.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => handleDelete(budget.id)} disabled={deletingId === budget.id}
                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                {deletingId === budget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden mb-3">
              <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">
                Terpakai: <span className="font-medium text-neutral-200">{fmt(budget.spent)}</span>
              </span>
              <span className={`font-medium ${textColor}`}>
                {isDanger ? `Melebihi ${fmt(Math.abs(remaining))}` : `Sisa ${fmt(remaining)} (${(100 - percentage).toFixed(0)}%)`}
              </span>
            </div>
            <div className="mt-1 text-xs text-neutral-500 text-right">Batas: {fmt(budget.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}
