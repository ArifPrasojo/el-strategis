'use client';

import { useState } from 'react';
import { deleteCategory, updateCategory } from './actions';
import { Trash2, Tags, Loader2, ArrowUpRight, ArrowDownRight, Edit3, X, Check } from 'lucide-react';
import { Category } from '@prisma/client';

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini? Transaksi terkait akan kehilangan kategorinya.')) return;
    setDeletingId(id);
    const formData = new FormData();
    formData.append('id', id);
    await deleteCategory(formData);
    setDeletingId(null);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditType(category.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditType('');
  };

  const handleUpdate = async (id: string) => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName);
    formData.append('type', editType);
    await updateCategory(formData);
    setIsUpdating(false);
    setEditingId(null);
  };

  if (categories.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
          <Tags className="w-8 h-8 text-neutral-500" />
        </div>
        <h3 className="text-xl font-medium text-neutral-300 mb-2">Belum ada kategori</h3>
        <p className="text-neutral-500">Buat kategori untuk mengorganisasi transaksi Anda.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {categories.map((category) => {
        const isIncome = category.type === 'INCOME';
        return (
          <div key={category.id} className="flex items-center justify-between p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-indigo-500/30 transition-colors group">
            {editingId === category.id ? (
              <div className="w-full flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1 space-y-2 w-full">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Nama Kategori"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="EXPENSE">Pengeluaran</option>
                    <option value="INCOME">Pemasukan</option>
                  </select>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleUpdate(category.id)} disabled={isUpdating} className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-colors">
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={cancelEdit} disabled={isUpdating} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-200">{category.name}</h3>
                    <p className="text-xs text-neutral-500">{isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(category)} className="p-2 text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(category.id)} disabled={deletingId === category.id} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" title="Hapus">
                    {deletingId === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
