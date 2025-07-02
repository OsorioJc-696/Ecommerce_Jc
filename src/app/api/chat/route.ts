// app/api/chat/route.ts
import { chatWithBot } from '@/ai/flows/chat-flow';

export async function POST(req: Request) {
  const body = await req.json();
  const reply = await chatWithBot(body);
  return Response.json(reply);
}
