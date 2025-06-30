'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PackageCheck, AlertCircle, Gift, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllOrdersForUser, type Order } from '@/lib/orders';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?redirect=/orders');
      return;
    }

    async function loadOrders() {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const userOrders = await getAllOrdersForUser(currentUser.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your orders.' });
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser) {
      loadOrders();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [currentUser, authLoading, router, toast]);

  const renderCustomizationDetails = (details: any) => {
    if (!details || typeof details !== 'object') return null;
    return (
      <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 pl-1 space-y-0.5">
        {Object.entries(details).map(([key, value]) => (
          <li key={key}><span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}</li>
        ))}
      </ul>
    );
  };

  if (isLoading || authLoading) {
    return <OrdersPageSkeleton />;
  }

  if (!currentUser) {
    return <div className="container mx-auto px-4 py-12 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <PackageCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Order History
            {orders.length > 0 && (
              <Badge variant="default" className="ml-2 text-sm">
                {orders.length} orders
              </Badge>
            )}
          </h1>
          <CardDescription className="text-muted-foreground">
            View your purchase history in detail.
          </CardDescription>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="max-w-xl mx-auto shadow-lg border border-border bg-muted text-muted-foreground text-center">
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
            <CardDescription>You haven't placed any orders yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button variant="default">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="bg-card text-card-foreground shadow-md border border-border">
              <CardHeader className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div>
                  <CardTitle className="text-xl font-semibold">Order #{order.id.substring(0, 8)}...</CardTitle>
                  <CardDescription className="text-sm">Placed: {new Date(order.orderDate).toLocaleDateString()}</CardDescription>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  <div className="text-lg font-bold text-primary">${Number(order.total).toFixed(2)}</div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm font-medium">
                      View Details ({order.items.length} items)
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between border-b pb-2">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            {renderCustomizationDetails(item.customizationDetails)}
                            {item.giftWrap && (
                              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                                <Gift className="h-3 w-3" /> Gift Wrapped
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-sm">${Number(item.price).toFixed(2)}</p>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">Subtotal:</span> ${Number(order.subtotal).toFixed(2)}</p>
                        {Number(order.giftWrapTotal) > 0 && (
                          <p><span className="font-medium">Gift Wrap:</span> ${Number(order.giftWrapTotal).toFixed(2)}</p>
                        )}
                        <p><span className="font-medium">Shipping:</span> Free</p>
                        <p className="font-semibold pt-1">Total Paid: ${Number(order.total).toFixed(2)}</p>
                      </div>
                      <Separator className="my-3" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">Shipped To:</span> {order.shippingAddress}</p>
                        <p><span className="font-medium">Billed To:</span> {order.billingAddress} ({order.billingEmail})</p>
                      </div>
                      <Link href={`/orders/confirmation?orderId=${order.id}`} className="inline-block pt-3">
                        <Button variant="outline" size="sm">View Confirmation</Button>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border border-border">
            <CardHeader className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-6 w-20 ml-auto mt-1" />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <Skeleton className="h-9 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
