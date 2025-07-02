// src/app/api/users/[id]/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

// GET /api/users/:id
export async function GET(_: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_GET_ID_ERROR]', error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

// PUT /api/users/:id
export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        email: body.email,
        password: body.password,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_PUT_ID_ERROR]', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(_: Request, { params }: Params) {
  try {
    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[USER_DELETE_ID_ERROR]', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
