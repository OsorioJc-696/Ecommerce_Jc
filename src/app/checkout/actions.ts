'use server';

import { PrismaOrder, PrismaOrderItem } from '@prisma/client';
import { generateOrderId } from '@/lib/orders';
import { getProductById } from '@/lib/products';
import prisma from '@/lib/prisma';

export async function processOrderAction(
  userId: number,
  cartItemsData: Array<
    Omit<PrismaOrderItem, 'id' | 'orderId' | 'price'> & { price: number; productId: number }
  >,
  orderSummary: Pick<
    PrismaOrder,
    | 'subtotal'
    | 'giftWrapTotal'
    | 'total'
    | 'shippingAddress'
    | 'billingAddress'
    | 'billingEmail'
    | 'paymentMethod'
  >
): Promise<{ success: boolean; orderId?: string; message: string }> {
  try {
    // Verifica stock antes de continuar
    for (const item of cartItemsData) {
      const product = await getProductById(item.productId);
      if (!product || product.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.name}. Only ${product?.stock ?? 0} available.`,
        };
      }
    }

    // ✅ CORREGIDO: espera el ID generado
    const orderId = await generateOrderId();

    const orderData: Omit<PrismaOrder, 'createdAt' | 'updatedAt'> & { userId: number } = {
      id: orderId,
      userId,
      subtotal: orderSummary.subtotal,
      giftWrapTotal: orderSummary.giftWrapTotal,
      total: orderSummary.total,
      status: 'Processing',
      orderDate: new Date(),
      shippingAddress: orderSummary.shippingAddress,
      billingAddress: orderSummary.billingAddress,
      billingEmail: orderSummary.billingEmail,
      paymentMethod: orderSummary.paymentMethod,
    };

    const itemsToCreate = cartItemsData.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      customizationDetails: item.customizationDetails ?? null,
      giftWrap: item.giftWrap,
      image: item.image,
    }));

    await prisma.$transaction(async tx => {
      await tx.order.create({
        data: {
          ...orderData,
          items: { create: itemsToCreate },
        },
      });

      for (const item of itemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    });

    return { success: true, orderId, message: 'Order placed successfully!' };
  } catch (error) {
    console.error('Error processing order:', error);
    return { success: false, message: 'Failed to save order. Please try again later.' };
  }
}
