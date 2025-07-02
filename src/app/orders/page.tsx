'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllOrdersForUser, type Order } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { PackageCheck } from 'lucide-react';
import { CardDescription } from '@/components/ui/card';
import OrdersPageSkeleton from '@/components/orders/OrdersPageSkeleton';
import NoOrdersCard from '@/components/orders/NoOrdersCard';
import OrderCard from '@/components/orders/OrderCard';

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
          <CardDescription className="text-muted-foreground">View your purchase history in detail.</CardDescription>
        </div>
      </div>

      {orders.length === 0 ? (
        <NoOrdersCard />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
