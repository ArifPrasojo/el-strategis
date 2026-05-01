'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr)
  const type = formData.get('type') as string
  const dateStr = formData.get('date') as string
  const description = formData.get('description') as string
  const accountId = formData.get('accountId') as string
  const categoryId = formData.get('categoryId') as string || null
  const wishlistId = formData.get('wishlistId') as string || null

  if (!amount || amount <= 0) return { error: 'Amount must be greater than 0' }
  if (type !== 'INCOME' && type !== 'EXPENSE') return { error: 'Invalid transaction type' }
  if (!dateStr) return { error: 'Date is required' }
  if (!accountId) return { error: 'Account is required' }

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

    // Wrap in a transaction to ensure atomic updates
    await prisma.$transaction(async (tx) => {
      // Create the transaction record
      await tx.transaction.create({
        data: {
          amount,
          type,
          date: new Date(dateStr),
          description,
          accountId,
          categoryId,
          wishlistId,
          userId: user.id
        }
      })

      // Update the account balance
      const balanceChange = type === 'INCOME' ? amount : -amount;
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChange }
        }
      })

      // If linked to wishlist, update savedAmount
      if (wishlistId) {
        // Income adds to savings, Expense reduces it? 
        // User said "tabungan dari wishlist diambil dari pemasukan"
        // So INCOME should increase savedAmount.
        const savingChange = type === 'INCOME' ? amount : -amount;
        await tx.wishlist.update({
          where: { id: wishlistId },
          data: {
            savedAmount: { increment: savingChange }
          }
        })
      }
    });
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard/accounts')
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to record transaction' }
  }
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  const id = formData.get('id') as string
  if (!id) return { error: 'Transaction ID is required' }

  try {
    const transactionRecord = await prisma.transaction.findUnique({ where: { id } })
    if (!transactionRecord || transactionRecord.userId !== user.id) return { error: 'Unauthorized' }

    await prisma.$transaction(async (tx) => {
      // Revert the account balance
      const balanceChange = transactionRecord.type === 'INCOME' ? -transactionRecord.amount : transactionRecord.amount;
      await tx.account.update({
        where: { id: transactionRecord.accountId },
        data: {
          balance: { increment: balanceChange }
        }
      })

      // Revert wishlist savedAmount if linked
      if (transactionRecord.wishlistId) {
        const savingChange = transactionRecord.type === 'INCOME' ? -transactionRecord.amount : transactionRecord.amount;
        await tx.wishlist.update({
          where: { id: transactionRecord.wishlistId },
          data: {
            savedAmount: { increment: savingChange }
          }
        })
      }

      // Delete the transaction
      await tx.transaction.delete({ where: { id } })
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard/accounts')
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete transaction' }
  }
}

export async function updateTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr)
  const type = formData.get('type') as string
  const dateStr = formData.get('date') as string
  const description = formData.get('description') as string
  const accountId = formData.get('accountId') as string
  const categoryId = formData.get('categoryId') as string || null
  const wishlistId = formData.get('wishlistId') as string || null

  if (!id || !amount || amount <= 0) return { error: 'Invalid ID or Amount' }
  if (type !== 'INCOME' && type !== 'EXPENSE') return { error: 'Invalid transaction type' }
  if (!dateStr || !accountId) return { error: 'Date and Account are required' }

  try {
    const oldTx = await prisma.transaction.findUnique({ where: { id } })
    if (!oldTx || oldTx.userId !== user.id) return { error: 'Unauthorized' }

    await prisma.$transaction(async (tx) => {
      // 1. Revert old transaction impact
      const revertBalanceChange = oldTx.type === 'INCOME' ? -oldTx.amount : oldTx.amount;
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { balance: { increment: revertBalanceChange } }
      });

      if (oldTx.wishlistId) {
        const revertSavingChange = oldTx.type === 'INCOME' ? -oldTx.amount : oldTx.amount;
        await tx.wishlist.update({
          where: { id: oldTx.wishlistId },
          data: { savedAmount: { increment: revertSavingChange } }
        });
      }

      // 2. Apply new transaction impact
      const newBalanceChange = type === 'INCOME' ? amount : -amount;
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: newBalanceChange } }
      });

      if (wishlistId) {
        const newSavingChange = type === 'INCOME' ? amount : -amount;
        await tx.wishlist.update({
          where: { id: wishlistId },
          data: { savedAmount: { increment: newSavingChange } }
        });
      }

      // 3. Update the transaction record
      await tx.transaction.update({
        where: { id },
        data: {
          amount,
          type,
          date: new Date(dateStr),
          description,
          accountId,
          categoryId,
          wishlistId
        }
      });
    });

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard/accounts')
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update transaction' }
  }
}
