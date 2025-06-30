import { getAuthUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity = 1, giftWrap = false, customizationDetails = null } = await req.json();

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        CartItem_userId_productId_key: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: {
          CartItem_userId_productId_key: {
            userId: user.id,
            productId,
          },
        },
        data: {
          quantity,
          giftWrap,
          customizationDetails,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          giftWrap,
          customizationDetails,
        },
      });
    }

    return NextResponse.json({ message: 'Producto agregado o actualizado en el carrito' });
  } catch (error) {
    console.error('POST /cart error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /cart error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity, giftWrap, customizationDetails } = await req.json();

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        CartItem_userId_productId_key: {
          userId: user.id,
          productId,
        },
      },
      data: {
        quantity,
        giftWrap,
        customizationDetails,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('PUT /cart error:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto del carrito' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Falta productId' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: {
        CartItem_userId_productId_key: {
          userId: user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('DELETE /cart error:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto del carrito' }, { status: 500 });
  }
}
