// src/app/api/admin/orders/route.ts

import { getAuthUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { email: true, username: true, id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /admin/orders error:", error);
    return NextResponse.json({ error: "Error fetching admin orders" }, { status: 500 });
  }
}
