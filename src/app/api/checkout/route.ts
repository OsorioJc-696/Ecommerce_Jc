// /app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { generateOrderId } from '@/lib/orders';

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      shippingAddress,
      billingAddress,
      billingEmail,
      paymentMethod,
    } = await req.json();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    const itemsToOrder = cartItems.map(item => {
      if (!item.product || item.product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto: ${item.product?.name}`);
      }

      return {
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        customizationDetails: item.customizationDetails,
        giftWrap: item.giftWrap,
        image: item.product.image,
      };
    });

    const subtotal = itemsToOrder.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const giftWrapTotal = itemsToOrder.reduce(
      (sum, item) => sum + (item.giftWrap ? 5 : 0),
      0
    );
    const total = subtotal + giftWrapTotal;

    const orderId = await generateOrderId();

    // Transacción protegida (15s de timeout)
    await prisma.$transaction(async tx => {
      // Crear la orden
      await tx.order.create({
        data: {
          id: orderId,
          userId: user.id,
          subtotal,
          giftWrapTotal,
          total,
          status: 'Processing',
          orderDate: new Date(),
          shippingAddress,
          billingAddress,
          billingEmail,
          paymentMethod,
          items: {
            create: itemsToOrder,
          },
        },
      });

      // Disminuir stock
      await Promise.all(
        itemsToOrder.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          })
        )
      );
    }, { timeout: 15000 }); // <-- importante

    // Vaciar carrito
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({
      message: 'Pedido exitoso',
      orderId,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({
      error: err.message ?? 'Error interno del servidor',
    }, { status: 500 });
  }
}
