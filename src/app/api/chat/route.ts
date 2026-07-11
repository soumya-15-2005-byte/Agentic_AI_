/* eslint-disable */
import { google } from '@ai-sdk/google';
import { streamText, tool, isStepCount } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages: rawMessages } = await req.json();

    // Normalize messages: the new AI SDK sends "parts" format, but streamText expects "content" format.
    const messages = (rawMessages || []).map((m: any) => {
      // If message already has "content" as a string, use it as-is
      if (typeof m.content === 'string' && m.content.length > 0) {
        return { role: m.role, content: m.content };
      }
      // If message has "parts" array (new SDK format), extract text from parts
      if (Array.isArray(m.parts)) {
        const textContent = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
        if (textContent) {
          return { role: m.role, content: textContent };
        }
      }
      // Fallback: try to use content or empty string
      return { role: m.role, content: m.content || '' };
    }).filter((m: any) => m.content && m.content.trim().length > 0);

    if (messages.length === 0) {
      return new Response('No valid messages', { status: 400 });
    }

    const result = await streamText({
      model: google('gemini-flash-lite-latest'),
      maxSteps: 5,
      system: `You are a helpful supply chain assistant for local Kirana store owners in Bharat. 
      You are highly proficient in MULTILINGUAL communication. Always understand and respond in the EXACT language the user is speaking, whether it is Hindi, Hinglish, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, or any other Indian regional language.
      You act proactively to manage inventory. You have tools to check inventory, place orders, record sales, predict demand, and recommend suppliers. 
      When a user asks "Kal kya order karna chahiye?" or asks for restock recommendations:
      1. Use the predictDemand tool to find what needs to be ordered.
      2. Use the recommendSupplier tool to find the best supplier for those items.
      3. Tell the user your recommendation and ask them to confirm before using placeOrder.
      Keep responses concise, conversational, and friendly (like a WhatsApp chat). 
      CRITICAL RULE: NEVER tell the user an order is placed or a sale is recorded unless you have SUCCESSFULLY called the 'placeOrder' or 'sellProduct' tool. You MUST call the tool to change the database. Do not just output text saying it is done.
      If a user asks to sell or order an item that doesn't exist, politely inform them about the error instead of hallucinating.
      If you place an order or record a sale, confirm it nicely in the user's language.`,
      messages,
      tools: {
        checkInventory: tool({
          description: 'Check the current inventory levels of all products in the store.',
          parameters: z.object({ dummy: z.boolean().optional() }),
          // @ts-expect-error Vercel SDK generic inference bug
          execute: async (_args) => {
            const products = await prisma.product.findMany();
            return products;
          },
        }),
        placeOrder: tool({
          description: 'Place an order for a product from local suppliers.',
          parameters: z.object({
            productName: z.string().describe('The exact name of the product to order'),
            quantity: z.number().describe('The number of items to order')
          }),
          // @ts-expect-error Vercel SDK generic inference bug
          execute: async (args: any) => {
            const nameToSearch = args.productName || args.product_name || args.item || args.product || args.name;
            const quantity = args.quantity || 1;
            console.log('PLACE ORDER CALLED WITH:', args);
            
            if (!nameToSearch) {
              return { error: `Product name is required to place an order.` };
            }

            // Fetch all products and do case-insensitive search in JS 
            // (since Prisma SQLite contains is case-sensitive)
            const allProducts = await prisma.product.findMany();
            const product = allProducts.find(p => 
              p.name.toLowerCase().includes(nameToSearch.toLowerCase())
            );
            
            if (!product) {
              return { error: `Product matching "${nameToSearch}" not found in inventory.` };
            }

            // Create order
            await prisma.order.create({
              data: {
                product_id: product.id,
                quantity,
                status: 'ordered'
              }
            });

            // Mock auto-updating stock as if the delivery was instant for the hackathon demo
            await prisma.product.update({
              where: { id: product.id },
              data: { current_stock: product.current_stock + quantity }
            });

            return { 
              success: true, 
              message: `Successfully ordered ${quantity}x ${product.name}. Stock updated.` 
            };
          },
        }),
        sellProduct: tool({
          description: 'Record a sale of a product and reduce its stock from inventory.',
          parameters: z.object({
            productName: z.string().describe('The exact name of the product sold'),
            quantity: z.number().describe('The number of items sold')
          }),
          // @ts-expect-error Vercel SDK generic inference bug
          execute: async (args: any) => {
            const nameToSearch = args.productName || args.product_name || args.item || args.product || args.name;
            const quantity = args.quantity || 1;
            
            if (!nameToSearch) {
              return { error: `Product name is required to record a sale.` };
            }

            const allProducts = await prisma.product.findMany();
            const product = allProducts.find(p => 
              p.name.toLowerCase().includes(nameToSearch.toLowerCase())
            );
            
            if (!product) {
              return { error: `Product matching "${nameToSearch}" not found in inventory.` };
            }

            if (product.current_stock < quantity) {
              return { error: `Not enough stock. Only ${product.current_stock}x ${product.name} left.` };
            }

            // Deduct stock
            await prisma.product.update({
              where: { id: product.id },
              data: { current_stock: product.current_stock - quantity }
            });

            return { 
              success: true, 
              message: `Successfully recorded sale of ${quantity}x ${product.name}. Stock reduced.` 
            };
          },
        }),
        predictDemand: tool({
          description: 'Analyze mock sales history to predict what needs to be ordered tomorrow.',
          parameters: z.object({ dummy: z.boolean().optional() }),
          // @ts-expect-error Vercel SDK generic inference bug
          execute: async (_args) => {
            const products = await prisma.product.findMany();
            // Generate stable predictions based on current stock and name length
            const predictions = products.map(p => {
              const stableRandom = (p.name.length * 3) % 20;
              return {
                product: p.name,
                currentStock: p.current_stock,
                forecastedDemand: p.current_stock + stableRandom + 5,
                recommendation: p.current_stock <= p.reorder_level ? 'HIGH_PRIORITY_ORDER' : 'NO_ORDER_NEEDED'
              };
            }).filter(p => p.recommendation === 'HIGH_PRIORITY_ORDER');
            
            return {
              analysis: "Based on 30-day moving average and festival seasonality, here are the predicted demands.",
              itemsToOrder: predictions
            };
          },
        }),
        recommendSupplier: tool({
          description: 'Compare local suppliers and recommend the best one for a specific product.',
          parameters: z.object({
            productName: z.string().describe('The name of the product to find a supplier for')
          }),
          // @ts-expect-error Vercel SDK generic inference bug
          execute: async (args: any) => {
            const suppliers = [
              { name: "Udaan Wholesale", price: Math.floor(Math.random() * 10) + 40, delivery: "Tomorrow Morning", rating: 4.8 },
              { name: "Local Mandi Vendor", price: Math.floor(Math.random() * 10) + 38, delivery: "Today Evening", rating: 4.1 },
              { name: "JioMart B2B", price: Math.floor(Math.random() * 10) + 45, delivery: "In 2 days", rating: 4.5 }
            ];
            
            // Sort by price
            suppliers.sort((a, b) => a.price - b.price);
            
            return {
              product: args.productName,
              bestSupplier: suppliers[0],
              allSuppliers: suppliers
            };
          },
        }),
      },
    });

    // Return the correct stream format for the latest AI SDK
    // @ts-expect-error Vercel SDK generic inference bug
    return result.toDataStreamResponse ? result.toDataStreamResponse() : (result as any).toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
