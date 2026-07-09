const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.chatHistory.deleteMany()

  console.log('Seeding products...')
  await prisma.product.createMany({
    data: [
      { name: 'Aashirvaad Atta 5kg', current_stock: 5, reorder_level: 10, price: 250.0 },
      { name: 'Tata Salt 1kg', current_stock: 3, reorder_level: 20, price: 25.0 },
      { name: 'Fortune Sunflower Oil 1L', current_stock: 12, reorder_level: 15, price: 145.0 },
      { name: 'Maggi Noodles 140g', current_stock: 45, reorder_level: 50, price: 14.0 },
      { name: 'Surf Excel Matic 1kg', current_stock: 2, reorder_level: 8, price: 210.0 }
    ]
  })

  console.log('Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
