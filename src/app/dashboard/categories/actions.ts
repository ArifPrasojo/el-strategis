'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const type = formData.get('type') as string // 'INCOME' or 'EXPENSE'

  if (!name || name.trim() === '') return { error: 'Category name is required' }
  if (type !== 'INCOME' && type !== 'EXPENSE') return { error: 'Invalid category type' }

  try {
    // Ensure the user exists in Prisma (sync from Supabase auth)
    let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
    if (dbUser && dbUser.id !== user.id) {
      await prisma.user.delete({ where: { email: user.email! } })
      dbUser = null
    }
    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id, email: user.email || '', name: user.user_metadata?.name || 'User', password: 'managed-by-supabase'
        }
      })
    }

    await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        userId: user.id
      }
    })
    
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create category' }
  }
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  const id = formData.get('id') as string
  if (!id) return { error: 'Category ID is required' }

  try {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category || category.userId !== user.id) return { error: 'Unauthorized' }

    await prisma.category.delete({ where: { id } })
    
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete category' }
  }
}
