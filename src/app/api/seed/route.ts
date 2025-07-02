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
