'use client';

import { useState } from 'react';
import { createBudget } from './actions';
import { PieChart, Plus, Loader2 } from 'lucide-react';
import { Category } from '@prisma/client';

export default function BudgetForm({ categories }: { categories: Category[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createBudget(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  };

  const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };

  const getLastDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <PieChart className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold">Buat Anggaran</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {expenseCategories.length === 0 ? (
        <div className="text-sm text-neutral-400 p-4 bg-neutral-800/50 rounded-xl text-center">
          Anda harus membuat setidaknya satu Kategori Pengeluaran terlebih dahulu.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Kategori</label>
            <select name="categoryId" required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none">
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Batas Anggaran (Rp)</label>
            <input name="amount" type="number" placeholder="0" min="1" required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Tanggal Mulai</label>
              <input name="startDate" type="date" required defaultValue={getFirstDayOfMonth()}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Tanggal Akhir</label>
              <input name="endDate" type="date" required defaultValue={getLastDayOfMonth()}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-neutral-950 font-semibold rounded-xl px-4 py-3 hover:bg-orange-400 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isLoading ? 'Menyimpan...' : 'Tetapkan Anggaran'}
          </button>
        </form>
      )}
    </div>
  );
}
