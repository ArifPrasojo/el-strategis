import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [budgets, categories, transactions] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.transaction.findMany({
      where: { userId: user.id, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } }
    })
  ]);

  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions.filter(t => t.categoryId === b.categoryId).reduce((acc, t) => acc + t.amount, 0);
    return { ...b, spent };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Anggaran</h1>
        <p className="text-sm text-neutral-400">Tetapkan batas pengeluaran per kategori dan pantau progresnya.</p>
      </div>

      <div className="block lg:hidden">
        <BudgetForm categories={categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetList budgets={budgetsWithSpent} />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <BudgetForm categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
