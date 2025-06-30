// app/api/products/route.ts
import prisma  from '@/lib/prisma'; // Asegúrate que tengas este archivo configurado
import { NextResponse } from 'next/server';

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        image: body.image,
        additionalImages: body.additionalImages,
        category: body.category,
        stock: body.stock,
        customizable: body.customizable,
        baseSpecs: body.baseSpecs,
        rating: parseFloat(body.rating),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[PRODUCT_POST_ERROR]', error); // ✅ Agrega esto
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}

