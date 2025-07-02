import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/products';

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ message: 'Database seeded.' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database.' }, { status: 500 });
  }
}


export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({ message: 'Seeded successfully', result });
  } catch (error) {
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
