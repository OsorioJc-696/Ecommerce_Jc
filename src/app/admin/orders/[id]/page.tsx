'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrderById, type Order } from '@/lib/orders'; // Use Prisma function
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, User, Mail, Home, CreditCard, Gift, Loader2 } from 'lucide-react'; // Added Loader2
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { FaPaypal, FaBitcoin } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Function to determine badge variant based on status
const getStatusVariant = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'Processing': return 'secondary';
    case 'Shipped': return 'default';
    case 'Delivered': return 'outline';
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

// Helper function to render payment method icon/text
const renderPaymentMethod = (method?: string | null) => { // Allow null
    if (!method) return <span className="text-muted-foreground">N/A</span>;
    switch (method) {
        case 'card': return <span className="flex items-center gap-1"><CreditCard className="h-4 w-4" /> Card</span>;
        case 'paypal': return <span className="flex items-center gap-1"><FaPaypal className="h-4 w-4 text-[#00457C]" /> PayPal</span>;
        case 'crypto': return <span className="flex items-center gap-1"><FaBitcoin className="h-4 w-4 text-orange-500" /> Crypto</span>;
        case 'other': return <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 2a10 10 0 0 0-10 10" /><path d="M12 12a10 10 0 0 1 10-10" /><path d="M12 12a10 10 0 0 0-10-10" /></svg> Mobile Transfer</span>;
        default: return <span className="capitalize">{method}</span>;
    }
};

// Helper to render customization details
const renderCustomizationDetails = (details: any) => {
   if (!details) return null;
   // Ensure details is an object before trying to map
   if (typeof details !== 'object' || details === null) return null;
   return (
        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 pl-1 space-y-0.5">
            {Object.entries(details).map(([key, value]) => (
               <li key={key}><span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}</li>
            ))}
        </ul>
   );
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderIdParam = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    async function loadOrder() {
        if (!orderIdParam) {
            setError("Order ID is missing.");
            setIsLoading(false);
            router.replace('/admin/orders');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
          const fetchedOrder = await getOrderById(orderIdParam); // Now async
          if (fetchedOrder) {
            setOrder(fetchedOrder);
          } else {
            setError(`Order ${orderIdParam} not found.`);
            // Redirect handled by error state below or keep user on page with message
             router.replace('/admin/orders');
          }
        } catch (fetchError) {
            console.error(`Failed to load order ${orderIdParam}:`, fetchError);
            setError("Failed to load order details.");
             // Optionally redirect on fetch error
             // router.replace('/admin/orders');
        } finally {
            setIsLoading(false);
        }
    }
    loadOrder();
  }, [orderIdParam, router]);

  if (isLoading) {
    return <AdminOrderDetailSkeleton />; // Show skeleton while loading
  }

  if (error) {
     // Display error message, optionally redirecting after a delay
     // setTimeout(() => router.replace('/admin/orders'), 3000);
    return <div className="flex items-center justify-center h-64 text-destructive">{error}</div>;
  }

  if (!order) {
     // Should ideally be covered by loading/error states, but added as a fallback
    return <div className="flex items-center justify-center h-64">Order not found. Redirecting...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
             <Link href="/admin/orders">
                <Button variant="outline" size="icon" className="h-7 w-7"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back</span></Button>
             </Link>
             <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Order: #{order.id.substring(0,8)}...</h1>
             <Badge variant={getStatusVariant(order.status)} className="ml-auto sm:ml-0">{order.status}</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Customer</CardTitle><User className="h-4 w-4 text-muted-foreground" /></CardHeader>
                 <CardContent>
                    <div className="text-sm font-medium">{order.billingEmail}</div>
                    <div className="text-xs text-muted-foreground">User ID: {order.userId}</div>
                 </CardContent>
             </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Shipping Address</CardTitle><Home className="h-4 w-4 text-muted-foreground" /></CardHeader>
                 <CardContent><div className="text-sm">{order.shippingAddress}</div></CardContent>
             </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Payment</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader>
                 <CardContent>
                    <div className="text-sm mb-1">{renderPaymentMethod(order.paymentMethod)}</div>
                    <div className="text-lg font-semibold">${Number(order.total).toFixed(2)}</div>
                 </CardContent>
             </Card>
        </div>

        {/* Order Items */}
        <Card>
            <CardHeader><CardTitle>Order Items ({order.items.length})</CardTitle></CardHeader>
            <CardContent>
                 <div className="space-y-4">
                     {order.items.map(item => (
                         <div key={item.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                             <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                 {item.image ? ( <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="64px" data-ai-hint={`product technology small`} />)
                                              : ( <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div> )}
                             </div>
                            <div className="flex-grow">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-xs text-muted-foreground">Price: ${Number(item.price).toFixed(2)}</p>
                                {renderCustomizationDetails(item.customizationDetails)}
                                {item.giftWrap && (<p className="text-xs text-primary flex items-center gap-1 mt-1"><Gift className="h-3 w-3"/> Gift Wrapped</p>)}
                            </div>
                            <p className="font-medium text-sm flex-shrink-0">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                     ))}
                 </div>
                 <Separator className="my-4" />
                 <div className="space-y-1 text-sm text-right">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                     {Number(order.giftWrapTotal) > 0 && (<div className="flex justify-between"><span className="text-muted-foreground">Gift Wrapping</span><span>+ ${Number(order.giftWrapTotal).toFixed(2)}</span></div>)}
                     <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>$0.00</span></div>
                     <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span>$0.00</span></div>
                     <Separator className="my-2"/>
                     <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

// Skeleton Component for Loading State
function AdminOrderDetailSkeleton() {
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-pulse">
            <div className="flex items-center gap-4">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 ml-auto rounded-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-4" /></CardHeader>
                        <CardContent className="space-y-1"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                                <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                                <div className="flex-grow space-y-1.5"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/4" /><Skeleton className="h-3 w-1/2" /></div>
                                <Skeleton className="h-5 w-16 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-1 text-sm text-right">
                        <div className="flex justify-between"><Skeleton className="h-4 w-20 ml-auto" /><Skeleton className="h-4 w-16 ml-auto" /></div>
                        <div className="flex justify-between"><Skeleton className="h-4 w-24 ml-auto" /><Skeleton className="h-4 w-14 ml-auto" /></div>
                        <div className="flex justify-between"><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-10 ml-auto" /></div>
                        <Separator className="my-2" />
                        <div className="flex justify-between"><Skeleton className="h-6 w-24 ml-auto" /><Skeleton className="h-6 w-20 ml-auto" /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
