import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';


async function getUserIdFromToken(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.id;
  } catch {
    return null;
  }
}

// ✅ GET: Obtener datos del usuario autenticado
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: {
        select: { productId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const favoriteProductIds = user.favorites.map(fav => fav.productId.toString());

  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email,
    dni: user.dni,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    address: user.address,
    photoUrl: user.photoUrl,
    isAdmin: user.isAdmin,
    favoriteProductIds:  user.favorites.length > 0 ? favoriteProductIds : [],
  };

  return NextResponse.json({ user: userResponse });
}

// ✅ PATCH: Actualizar perfil del usuario
export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { username, dni, firstName, lastName, phoneNumber, address, photoUrl } = await request.json();

try {
  const updatedUserRaw = await prisma.user.update({
    where: { id: userId },
    data: {
      username: username === '' ? null : username,
      dni: dni === '' ? null : dni,
      firstName: firstName === '' ? null : firstName,
      lastName: lastName === '' ? null : lastName,
      phoneNumber: phoneNumber === '' ? null : phoneNumber,
      address: address === '' ? null : address,
      photoUrl: photoUrl === '' ? null : photoUrl,
    },
    include: {
      favorites: {
        select: { productId: true },
      },
    },
  });

  const favoriteProductIds = updatedUserRaw.favorites.map(fav => fav.productId.toString());

  const updatedUser = {
    id: updatedUserRaw.id,
    username: updatedUserRaw.username,
    email: updatedUserRaw.email,
    dni: updatedUserRaw.dni,
    firstName: updatedUserRaw.firstName,
    lastName: updatedUserRaw.lastName,
    phoneNumber: updatedUserRaw.phoneNumber,
    address: updatedUserRaw.address,
    photoUrl: updatedUserRaw.photoUrl,
    isAdmin: updatedUserRaw.isAdmin,
    favoriteProductIds: updatedUserRaw.favorites.length > 0 ? favoriteProductIds : [],
  };

  return NextResponse.json({ user: updatedUser });

} catch (error: any) {
  if (error.code === 'P2002' && error.meta?.target?.includes('dni')) {
    return NextResponse.json(
      { message: 'El DNI ya está en uso por otro usuario.' },
      { status: 400 }
    );
  }
  if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
    return NextResponse.json(
      { message: 'El username ya está en uso por otro usuario.' },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { message: 'Error al actualizar usuario.' },
    { status: 500 }
  );
}

}

