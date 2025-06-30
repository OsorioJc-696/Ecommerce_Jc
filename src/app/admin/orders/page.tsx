'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getAllOrders, type Order, updateOrderStatus } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusVariant = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'Processing': return 'secondary';
    case 'Shipped': return 'default';
    case 'Delivered': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load orders." });
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatusOrderId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: updatedOrder.status } : order));
      toast({ title: "Order Status Updated", description: `Order ${orderId.substring(0, 8)}... marked as ${newStatus}.` });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update order status." });
    } finally {
      setUpdatingStatusOrderId(null);
    }
  };

  if (isLoading) return <AdminOrdersSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>View and manage customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                      #{order.id.substring(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>{order.billingEmail || `User ID: ${order.userId}`}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={updatingStatusOrderId === order.id}>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={updatingStatusOrderId === order.id}>
                          {updatingStatusOrderId === order.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/admin/orders/${order.id}`} passHref>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        {order.status === 'Processing' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="cursor-pointer">
                            <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {order.status === 'Shipped' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="cursor-pointer">
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Cancelled')} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <div className="text-center text-muted-foreground py-8">No orders found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminOrdersSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
