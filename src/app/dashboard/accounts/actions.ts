'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const balanceStr = formData.get('balance') as string
  const balance = parseFloat(balanceStr) || 0

  if (!name || name.trim() === '') {
    return { error: 'Account name is required' }
  }

  try {
    // Handle unique email constraint and stale data from previous test signups
    let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    
    if (dbUser && dbUser.id !== user.id) {
      // Clean up stale user with the same email but different ID (from old signups)
      await prisma.user.delete({ where: { email: user.email! } });
      dbUser = null;
    }

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || 'User',
          password: 'managed-by-supabase'
        }
      });
    }

    await prisma.account.create({
      data: {
        name: name.trim(),
        balance,
        userId: user.id
      }
    })
    
    revalidatePath('/dashboard/accounts')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create account' }
  }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const id = formData.get('id') as string

  if (!id) {
    return { error: 'Account ID is required' }
  }

  try {
    // Verify ownership
    const account = await prisma.account.findUnique({ where: { id } })
    if (!account || account.userId !== user.id) {
      return { error: 'Unauthorized to delete this account' }
    }

    await prisma.account.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/accounts')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete account' }
  }
}
