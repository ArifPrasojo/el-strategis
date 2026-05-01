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
  const savedAmount = parseFloat(formData.get('savedAmount') as string) || 0

  if (!name || isNaN(targetAmount) || targetAmount <= 0) {
    return { error: 'Nama dan target harga harus diisi dengan benar.' }
  }

  try {
    await prisma.wishlist.create({
      data: {
        name,
        targetAmount,
        savedAmount,
        userId: user.id
      }
    })
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal menambahkan wishlist.' }
  }
}

export async function updateWishlistProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi berakhir.' }

  const id = formData.get('id') as string
  const savedAmount = parseFloat(formData.get('savedAmount') as string)

  if (isNaN(savedAmount) || savedAmount < 0) {
    return { error: 'Jumlah tabungan tidak valid.' }
  }

  try {
    await prisma.wishlist.update({
      where: { id, userId: user.id },
      data: { savedAmount }
    })
    revalidatePath('/dashboard/wishlist')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal memperbarui progres.' }
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
