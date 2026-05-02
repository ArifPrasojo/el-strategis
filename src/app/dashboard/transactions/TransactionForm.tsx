'use client';

import { useState } from 'react';
import { createTransaction } from './actions';
import { ArrowLeftRight, Plus, Loader2, ListPlus, Trash2 } from 'lucide-react';
import { Account, Category, Wishlist } from '@prisma/client';

export default function TransactionForm({ accounts, categories, wishlist = [] }: { accounts: Account[], categories: Category[], wishlist?: Wishlist[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState('EXPENSE');
  
  // Itemized list states
  const [useItems, setUseItems] = useState(false);
  const [items, setItems] = useState<{ id: string; name: string; price: number }[]>([]);
  const [manualAmount, setManualAmount] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  // Helper to format number to Rp 10.000
  const formatRupiah = (value: string | number) => {
    if (!value) return '';
    const numberString = value.toString().replace(/\D/g, '');
    if (!numberString) return '';
    return new Intl.NumberFormat('id-ID').format(Number(numberString));
  };

  // Auto-calculate amount if using itemized list
  const calculatedAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const displayAmount = useItems ? calculatedAmount : manualAmount;

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), name: '', price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: 'name' | 'price', value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    // Override amount if using items or if manual amount has formatting
    if (useItems) {
      if (calculatedAmount <= 0) {
        setError('Total rincian barang harus lebih dari 0');
        setIsLoading(false);
        return;
      }
      formData.set('amount', calculatedAmount.toString());
      // Save items as JSON
      const cleanItems = items.filter(i => i.name.trim() !== '' && i.price > 0).map(({ name, price }) => ({ name, price }));
      if (cleanItems.length > 0) {
        formData.set('items', JSON.stringify(cleanItems));
      }
    } else {
      formData.set('amount', manualAmount);
    }

    const result = await createTransaction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      (e.target as HTMLFormElement).reset();
      setManualAmount('');
      setItems([]);
      setUseItems(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold">Catat Transaksi</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {accounts.length === 0 ? (
        <div className="text-sm text-neutral-400 p-4 bg-neutral-800/50 rounded-xl text-center">
          Anda harus membuat setidaknya satu Akun terlebih dahulu.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { setType('EXPENSE'); setUseItems(false); setItems([]); }}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}>
              Pengeluaran
            </button>
            <button type="button" onClick={() => { setType('INCOME'); setUseItems(false); setItems([]); }}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}>
              Pemasukan
            </button>
          </div>
          <input type="hidden" name="type" value={type} />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-neutral-300">Jumlah (Rp)</label>
              {type === 'EXPENSE' && (
                <button type="button" onClick={() => { setUseItems(!useItems); if (!useItems && items.length === 0) addItem(); }}
                  className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${useItems ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'}`}>
                  <ListPlus className="w-3.5 h-3.5" />
                  Rincian Barang
                </button>
              )}
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-sm text-neutral-500 font-medium">Rp</span>
              <input name="amount" type="text" inputMode="numeric" placeholder="0" required={!useItems}
                value={displayAmount ? formatRupiah(displayAmount) : ''}
                onChange={(e) => {
                  if (!useItems) {
                    setManualAmount(e.target.value.replace(/\D/g, ''));
                  }
                }}
                readOnly={useItems}
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors ${useItems ? 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-950 border-neutral-800 text-white'}`} />
            </div>
          </div>

          {/* Itemized List */}
          {useItems && (
            <div className="space-y-3 p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Daftar Barang</span>
                <span className="text-xs font-medium text-blue-400">Total: Rp {calculatedAmount.toLocaleString('id-ID')}</span>
              </div>
              
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-neutral-500">Barang #{index + 1}</span>
                    <button type="button" onClick={() => removeItem(item.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <input type="text" placeholder="Nama Barang (Cth: Roti)" value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-neutral-500 font-medium">Rp</span>
                      <input type="text" inputMode="numeric" placeholder="Harga" value={item.price ? formatRupiah(item.price) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          updateItem(item.id, 'price', raw ? Number(raw) : 0);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
                    </div>
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={addItem}
                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 border border-dashed border-neutral-700 rounded-lg transition-colors mt-2">
                <Plus className="w-3.5 h-3.5" /> Tambah Barang
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Tanggal</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Keterangan / Judul Transaksi</label>
            <input name="description" type="text" placeholder="Contoh: Makan Siang, Belanja Mingguan"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Akun</label>
            <select name="accountId" required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none">
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (Rp {acc.balance.toLocaleString('id-ID')})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Kategori</label>
              <select name="categoryId"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                <option value="">-- Kategori --</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Wishlist (Opsional)</label>
              <select name="wishlistId"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none">
                <option value="">-- Pilih Wishlist --</option>
                {wishlist.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-neutral-50 font-semibold rounded-xl px-4 py-3 hover:bg-blue-400 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      )}
    </div>
  );
}
