'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr)
  const categoryId = formData.get('categoryId') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string

  if (!amount || amount <= 0) return { error: 'Amount must be greater than 0' }
  if (!categoryId) return { error: 'Category is required' }
  if (!startDateStr || !endDateStr) return { error: 'Dates are required' }

  try {
    // Upsert User
    let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
    if (dbUser && dbUser.id !== user.id) {
      await prisma.user.delete({ where: { email: user.email! } })
      dbUser = null
    }
    if (!dbUser) {
      await prisma.user.create({ data: { id: user.id, email: user.email || '', name: user.user_metadata?.name || 'User', password: 'x' } })
    }

    await prisma.budget.create({
      data: {
        amount,
        categoryId,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        userId: user.id
      }
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create budget' }
  }
}

export async function deleteBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  const id = formData.get('id') as string
  if (!id) return { error: 'Budget ID is required' }

  try {
    const budget = await prisma.budget.findUnique({ where: { id } })
    if (!budget || budget.userId !== user.id) return { error: 'Unauthorized' }

    await prisma.budget.delete({ where: { id } })
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete budget' }
  }
}
