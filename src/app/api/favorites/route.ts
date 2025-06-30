import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();

  // Validar productId
  if (!productId || typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId inválido' }, { status: 400 });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: Number(user.id), // JWT id viene como string, prisma espera number
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Ya está en favoritos' }, { status: 200 });
    }

    await prisma.favorite.create({
      data: {
        userId: Number(user.id),
        productId,
      },
    });

    return NextResponse.json({ message: 'Favorito agregado' });
  } catch (error) {
    console.error('Error agregando favorito:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();

  // Validar productId
  if (!productId || typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId inválido' }, { status: 400 });
  }

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: Number(user.id),
        productId,
      },
    });

    return NextResponse.json({ message: 'Favorito eliminado' });
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category') || undefined;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
 
  const sortOrder: Prisma.SortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  const skip = (page - 1) * limit;

  // Validar campos permitidos
  const validProductFields = ['price', 'name'];
  const validFavoriteFields = ['createdAt'];

  const isProductField = validProductFields.includes(sortBy);
  const isFavoriteField = validFavoriteFields.includes(sortBy);

  const orderBy: any = isProductField
    ? { product: { [sortBy]: sortOrder } }
    : isFavoriteField
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' as Prisma.SortOrder }; // fallback seguro

  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: Number(user.id),
        product: category
          ? { category: { equals: category } }
          : undefined,
      },
      include: {
        product: true,
      },
      skip,
      take: limit,
      orderBy,
    });

    const total = await prisma.favorite.count({
      where: {
        userId: Number(user.id),
        product: category
          ? { category: { equals: category } }
          : undefined,
      },
    });

    return NextResponse.json({
      favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
