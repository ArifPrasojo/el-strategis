'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createWishlistItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi berakhir, silakan login kembali.' }

  const name = formData.get('name') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)

  if (!name || isNaN(targetAmount) || targetAmount <= 0) {
    return { error: 'Nama dan target harga harus diisi dengan benar.' }
  }

  try {
    await prisma.wishlist.create({
      data: {
        name,
        targetAmount,
        savedAmount: 0,
        userId: user.id
      }
    })
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal menambahkan wishlist.' }
  }
}

export async function deleteWishlistItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi berakhir.' }

  const id = formData.get('id') as string

  try {
    await prisma.wishlist.delete({
      where: { id, userId: user.id }
    })
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal menghapus item.' }
  }
}

export async function updateWishlistItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi berakhir.' }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const targetAmountStr = formData.get('targetAmount') as string
  const targetAmount = parseFloat(targetAmountStr)

  if (!id || !name || isNaN(targetAmount) || targetAmount <= 0) {
    return { error: 'Data tidak valid.' }
  }

  try {
    const item = await prisma.wishlist.findUnique({ where: { id } })
    if (!item || item.userId !== user.id) return { error: 'Tidak diizinkan.' }

    await prisma.wishlist.update({
      where: { id },
      data: { name, targetAmount }
    })
    
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal memperbarui item.' }
  }
}
