import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // asegúrate que esté bien configurado

export async function GET(req: NextRequest) {
  try {
    const favorites = await prisma.favorite.findMany({
      include: { product: true },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const { productId, userId } = await req.json();

    if (!productId || !userId) {
      return NextResponse.json({ message: 'Product ID and User ID are required' }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: { productId, userId },
    });

    if (existingFavorite) {
      return NextResponse.json({ message: 'Product already in favorites' }, { status: 409 });
    }

    const favorite = await prisma.favorite.create({
      data: { productId, userId },
    });

    return NextResponse.json({ favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
