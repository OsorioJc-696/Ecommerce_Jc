// /app/api/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

// ✅ GET: Obtener favoritos
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  return NextResponse.json({ favorites });
}

// ✅ POST: Agregar a favoritos
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId || typeof productId !== 'number') {
    return NextResponse.json({ message: 'Invalid productId' }, { status: 400 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Ya está en favoritos' }, { status: 409 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return NextResponse.json({ message: 'Error al agregar favorito' }, { status: 500 });
  }
}

// ✅ DELETE: Eliminar de favoritos
export async function DELETE(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId || typeof productId !== 'number') {
    return NextResponse.json({ message: 'Invalid productId' }, { status: 400 });
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ message: 'Eliminado de favoritos' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return NextResponse.json({ message: 'Error al eliminar favorito' }, { status: 500 });
  }
}
