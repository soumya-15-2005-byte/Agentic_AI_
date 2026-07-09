'use server'

import prisma from '@/lib/db'

export async function getInventory() {
  return await prisma.product.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      product: true
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 10
  })
}
