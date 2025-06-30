
'use server';
/**
 * @fileOverview Simple chatbot flow using Genkit and Gemini.
 *
 * - chatWithBot - A function that handles chat interactions.
 */

import { ai } from '@/ai/ai-instance';
import { getAllProducts } from '@/lib/products'; // Import Prisma function to get products
// Import schemas and types from the dedicated schema file
import { ChatInputSchema, ChatOutputSchema, type ChatInput, type ChatOutput } from '@/ai/schemas/chat-schemas';
import { z } from 'genkit'; // Import z from genkit

// --- Exported Wrapper Function ---

/**
 * Sends a message to the chatbot and returns the reply.
 * @param input - The user's message.
 * @returns The chatbot's reply.
 */
export async function chatWithBot(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// --- Genkit Prompt Definition ---

// Define a schema specifically for the prompt input, including the context
const ChatPromptInputSchema = ChatInputSchema.extend({
    productContext: z.string().describe("Contexto sobre los productos disponibles."),
});

const chatPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {
    schema: ChatPromptInputSchema, // Use the extended schema here
  },
  output: {
    schema: ChatOutputSchema,
  },
  prompt: `Eres un asistente de IA amigable y servicial para DigitalZone JC, una tienda de tecnología en línea.
Tu objetivo es responder a las preguntas de los clientes sobre productos, stock, personalización y consultas generales.
Sé conciso e informativo. Si no sabes la respuesta, dilo cortésmente.
**Responde SIEMPRE en español.**

Aquí tienes información sobre los productos disponibles:
{{{productContext}}}

Mensaje del usuario: {{{message}}}

Respuesta del asistente:`, // Ensure assistant response starts here
});

// --- Genkit Flow Definition ---

const chatFlow = ai.defineFlow<
  typeof ChatInputSchema, // Flow still uses the external ChatInputSchema
  typeof ChatOutputSchema // Flow still uses the external ChatOutputSchema
>(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Fetch product data dynamically
    let productContext = "No product information available.";
    try {
        const products = await getAllProducts(); // Fetch from DB
         // Limit context size and format for prompt
        productContext = products
            .slice(0, 15) // Limit context size for demo
            .map(p => `- ${p.name}: ${p.description ? p.description.substring(0, 100) : 'No description'}... (Precio: S/${Number(p.price).toFixed(2)}, Stock: ${p.stock})`) // Updated format
            .join('\n');
    } catch (error) {
        console.error("Error fetching product context for chatbot:", error);
        // Keep the default "No product information available." message
    }


    // Pass the product context along with the user message to the prompt
    const { output } = await chatPrompt({
        ...input,
        productContext: productContext, // Inject dynamic product context
    });
    // Ensure output is not null/undefined before returning
    if (!output) {
        throw new Error("El chatbot no devolvió una respuesta.");
    }
    return output;
  }
);
