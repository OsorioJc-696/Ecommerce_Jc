// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
import { Decimal } from 'decimal.js';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = parseInt(searchParams.get('perPage') || '12');

    const allProducts = await getAllProducts();

    // Filtro básico
    let filtered = allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search) ||
        (product.description || '').toLowerCase().includes(search);
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    // Paginación
    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    // Si usás Decimal.js
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
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
