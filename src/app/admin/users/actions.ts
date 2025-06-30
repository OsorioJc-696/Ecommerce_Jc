'use server';

import prisma from '@/lib/prisma';
import type { User as AuthUser } from '@/context/auth-context';

// Obtener todos los usuarios (sin contraseñas)
export async function fetchAllUsersAction(): Promise<AuthUser[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        dni: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        photoUrl: true,
        isAdmin: true,
        favorites: {
          select: {
            productId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      ...user,
      favoriteProductIds: user.favorites.map(fav => fav.productId),
    })) as AuthUser[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Could not load users.');
  }
}

// Eliminar usuario
export async function deleteUserAction(userId: number): Promise<boolean> {
  try {
    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });

    if (userToDelete?.email === 'admin@digitalzone.com') {
      throw new Error('Cannot delete main admin.');
    }

    await prisma.user.delete({ where: { id: userId } });
    return true;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw new Error('Could not delete user.');
  }
}

// Actualizar rol de administrador
export async function updateUserAdminStatusAction(userId: number, isAdmin: boolean): Promise<AuthUser> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        username: true,
        email: true,
        dni: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        photoUrl: true,
        isAdmin: true,
        favorites: {
          select: { productId: true },
        },
      },
    });

    return {
      ...updatedUser,
      favoriteProductIds: updatedUser.favorites.map(fav => fav.productId),
    } as AuthUser;
  } catch (error) {
    console.error(`Error updating admin status for user ${userId}:`, error);
    throw new Error('Could not update admin status.');
  }
}
