// /app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth'; // tu propia lógica de auth
import prisma from '@/lib/prisma'; // si usas Prisma

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id },
    include: { product: true },
  });

  return NextResponse.json({ favorites });
}
