// /lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  email: string;
  isAdmin?: boolean;
}

export async function getAuthUserFromRequest(req: unknown): Promise<{ id: number; email: string; isAdmin: boolean; } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decoded.id || !decoded.email) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin ?? false,
    };
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return null;
  }
}
