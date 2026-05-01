'use client';

import { useState } from 'react';
import { deleteBudget, updateBudget } from './actions';
import { Trash2, PieChart, Loader2, AlertTriangle, Edit3, X, Check } from 'lucide-react';
import { Budget, Category } from '@prisma/client';

type BudgetWithRelations = Budget & { category: Category; spent: number; };

export default function BudgetList({ budgets }: { budgets: BudgetWithRelations[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus anggaran ini?')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteBudget(formData);
    setDeletingId(null);
  };

  const startEdit = (budget: BudgetWithRelations) => {
    setEditingId(budget.id);
    setEditAmount(budget.amount.toString());
    setEditStartDate(new Date(budget.startDate).toISOString().split('T')[0]);
    setEditEndDate(new Date(budget.endDate).toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditStartDate('');
    setEditEndDate('');
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('amount', editAmount);
    formData.append('startDate', editStartDate);
    formData.append('endDate', editEndDate);
    await updateBudget(formData);
    setIsUpdating(false);
    setEditingId(null);
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
            {editingId === budget.id ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-200">{budget.category.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">Batas Anggaran</label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">Tanggal Akhir</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <button onClick={() => handleUpdate(budget.id)} disabled={isUpdating} className="p-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl transition-colors flex-1 flex justify-center items-center">
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button onClick={cancelEdit} disabled={isUpdating} className="p-2.5 bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-1 flex justify-center items-center">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(budget)} className="p-2 text-neutral-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(budget.id)} disabled={deletingId === budget.id}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === budget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
