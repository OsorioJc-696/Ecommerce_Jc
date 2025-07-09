import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    // Mapear a solo los nombres de categoría
    const categoryNames = categories.map((c) => c.category).filter(Boolean);

    return NextResponse.json({ categories: categoryNames });
  } catch (error) {
    console.error('[GET_CATEGORIES_ERROR]', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}
