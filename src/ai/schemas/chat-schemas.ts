/**
 * @fileOverview Defines Zod schemas and TypeScript types for chat flow inputs and outputs.
 */

import { z } from 'genkit';

// --- Input Schema and Type ---
export const ChatInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
  // Optional: Include history for more context-aware conversations
  // history: z.array(z.object({
  //   role: z.enum(['user', 'bot']),
  //   content: z.array(z.object({ text: z.string() })),
  // })).optional().describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;


// --- Output Schema and Type ---
export const ChatOutputSchema = z.object({
  reply: z.string().describe("The chatbot's reply to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;