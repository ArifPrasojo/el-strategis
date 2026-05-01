import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [transactions, accounts, categories, wishlist] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, account: true },
      orderBy: { date: 'desc' }
    }),
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.wishlist.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Transaksi</h1>
        <p className="text-sm text-neutral-400">Catat dan tinjau pemasukan serta pengeluaran harian Anda.</p>
      </div>

      {/* Form on top on mobile */}
      <div className="block lg:hidden">
        <TransactionForm accounts={accounts} categories={categories} wishlist={wishlist} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} accounts={accounts} categories={categories} wishlist={wishlist} />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TransactionForm accounts={accounts} categories={categories} wishlist={wishlist} />
          </div>
        </div>
      </div>
    </div>
  );
}
