const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDB() {
  // Clear all chats
  await prisma.chatHistory.deleteMany({});
  
  // Clear all orders
  await prisma.order.deleteMany({});
  
  // Reset stocks
  const products = await prisma.product.findMany();
  for (const product of products) {
    let newStock = product.current_stock;
    if (product.name.includes('Aashirvaad')) newStock = 25; // high
    if (product.name.includes('Tata Salt')) newStock = 5; // low
    if (product.name.includes('Fortune')) newStock = 20; // high
    if (product.name.includes('Maggi')) newStock = 60; // high
    if (product.name.includes('Surf Excel')) newStock = 4; // low
    
    await prisma.product.update({
      where: { id: product.id },
      data: { current_stock: newStock }
    });
  }
  
  console.log("Database reset complete!");
}

resetDB().catch(console.error).finally(() => prisma.$disconnect());
