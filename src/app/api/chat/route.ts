/* eslint-disable */
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
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
      model: google('gemini-2.5-flash'),
      system: `You are a helpful supply chain assistant for local Kirana store owners in Bharat. 
      You understand Hinglish and local terms. You act proactively to manage inventory. 
      You have tools to check inventory and place orders. 
      Keep responses concise, conversational, and friendly (like a WhatsApp chat). 
      If you place an order, confirm it nicely.`,
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
          execute: async ({ productName, quantity }) => {
            // Find product by name
            const product = await prisma.product.findFirst({
              where: { name: { contains: productName } } // basic search
            });
            
            if (!product) {
              return { error: `Product matching "${productName}" not found in inventory.` };
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
      },
    });

    // @ts-expect-error Vercel SDK version mismatch
    return result.toDataStreamResponse ? result.toDataStreamResponse() : (result as any).toTextStreamResponse ? (result as any).toTextStreamResponse() : (result as any).toAIStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
