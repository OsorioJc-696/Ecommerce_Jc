// src/app/api/orders/route.ts
import { getAuthUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (!cartItems.length) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * Number(item.product?.price || 0);
    }, 0);

    const order = await prisma.order.create({
      data: {
        id: crypto.randomUUID(), // Generate a unique ID for the order
        user: { connect: { id: user.id } },
        total,
        subtotal: total, // You may want to calculate subtotal separately if needed
        giftWrapTotal: cartItems.reduce((sum, item) => sum + (item.giftWrap ? 10 : 0), 0), // Example: $10 per gift wrap
        status: "PENDING", // Or whatever default status you use
        shippingAddress: "", // Provide actual shipping address here
        billingAddress: "", // Provide actual billing address here
        billingEmail: user.email || "", // Provide actual billing email here
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            name: item.product?.name || "Producto desconocido",
            quantity: item.quantity,
            price: item.product?.price || 0,
            customizationDetails: item.customizationDetails as any,
            giftWrap: item.giftWrap,
            image: item.product?.image || null,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /orders error:", error);
    return NextResponse.json({ error: "Error al crear la orden" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /orders error:", error);
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 });
  }
}
