import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Manajemen Kategori</h1>
        <p className="text-sm text-neutral-400">Organisasi pemasukan dan pengeluaran Anda dengan kategori yang tepat.</p>
      </div>

      <div className="block lg:hidden">
        <CategoryForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryList categories={categories} />
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <CategoryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
