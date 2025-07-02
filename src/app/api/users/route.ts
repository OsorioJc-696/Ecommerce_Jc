// src/app/api/users/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/users → listar todos los usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('[USER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// POST /api/users → crear nuevo usuario
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password, // asegúrate de encriptarla si es producción
        username: body.username, // asegúrate de recibir username en el body
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[USER_POST_ERROR]', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
