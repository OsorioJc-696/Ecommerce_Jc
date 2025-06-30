'use server';

import prisma from './prisma';
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import type { CartItem } from '@/context/cart-context';

export type Order = PrismaOrder & {
  items: OrderItem[];
};
export type OrderItem = PrismaOrderItem;

/**
 * Generates a unique order ID (simple version for demo).
 */
export async function generateOrderId(): Promise<string> {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { email: true, username: true } }
      },
      orderBy: { orderDate: 'desc' },
    });

    return orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal),
      giftWrapTotal: Number(o.giftWrapTotal),
      total: Number(o.total),
      items: o.items.map(item => ({
        ...item,
        price: Number(item.price),
        customizationDetails: item.customizationDetails as any,
      })),
    }));
  } catch (error) {
    console.error("Failed to load orders:", error);
    throw new Error("Could not fetch orders.");
  }
}

export async function saveOrder(
  orderData: Omit<PrismaOrder, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & { userId: number; id: string },
  itemsData: Omit<PrismaOrderItem, 'id' | 'orderId'>[]
): Promise<Order> {
  try {
    const createdOrder = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: itemsData.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            customizationDetails: item.customizationDetails as any,
            giftWrap: item.giftWrap,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });

    return {
      ...createdOrder,
      subtotal: Number(createdOrder.subtotal),
      giftWrapTotal: Number(createdOrder.giftWrapTotal),
      total: Number(createdOrder.total),
      items: createdOrder.items.map(item => ({
        ...item,
        price: Number(item.price),
        customizationDetails: item.customizationDetails as any,
      })),
    };
  } catch (error) {
    console.error("Failed to save order:", error);
    throw new Error("Could not save order.");
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true, username: true, id: true } },
      },
    });

    if (!order) return null;

    return {
      ...order,
      subtotal: Number(order.subtotal),
      giftWrapTotal: Number(order.giftWrapTotal),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        customizationDetails: item.customizationDetails as any,
      })),
    };
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw new Error("Could not fetch order details.");
  }
}

export async function getAllOrdersForUser(userId: number): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { orderDate: 'desc' },
    });

    return orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal),
      giftWrapTotal: Number(o.giftWrapTotal),
      total: Number(o.total),
      items: o.items.map(item => ({
        ...item,
        price: Number(item.price),
        customizationDetails: item.customizationDetails as any,
      })),
    }));
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw new Error("Could not fetch user's orders.");
  }
}

export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order> {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { items: true },
    });

    return {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      giftWrapTotal: Number(updatedOrder.giftWrapTotal),
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map(item => ({
        ...item,
        price: Number(item.price),
        customizationDetails: item.customizationDetails as any,
      })),
    };
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw new Error("Could not update order status.");
  }
}
