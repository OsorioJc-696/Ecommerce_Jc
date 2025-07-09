// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
import { Decimal } from 'decimal.js';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';
    const customizable = searchParams.get('customizable') === 'true';

    // Solo usar paginación si no se pide personalizado
    const page = customizable
      ? 1
      : Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = customizable
      ? Number.MAX_SAFE_INTEGER
      : parseInt(searchParams.get('perPage') || '12');

    const allProducts = await getAllProducts();

    const filtered = allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        (product.description || '').toLowerCase().includes(search);
      const matchesCategory = category === 'all' || product.category === category;
      const matchesCustomizable = !customizable || Boolean(product.customizable) === true;

      return matchesSearch && matchesCategory && matchesCustomizable;
    });

    const total = filtered.length;
    const totalPages = customizable
      ? 1
      : Math.ceil(total / perPage);

    const paginated = customizable
      ? filtered // mostrar todos sin paginar
      : filtered.slice((page - 1) * perPage, page * perPage);

    const safeProducts = paginated.map((product) => ({
      ...product,
      price: Number(product.price),
      rating: product.rating != null ? Number(product.rating) : null,
    }));

    return NextResponse.json({
      products: safeProducts,
      total,
      page,
      perPage,
      totalPages,
    });
  } catch (error) {
    console.error('[GET_PRODUCTS_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

