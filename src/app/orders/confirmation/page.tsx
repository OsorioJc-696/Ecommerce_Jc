'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Gift, CreditCard, Loader2 } from 'lucide-react';
import { FaPaypal, FaBitcoin } from 'react-icons/fa';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { getOrderById, type Order } from '@/lib/orders';

function OrderConfirmationSkeleton() {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg animate-pulse rounded-2xl">
          <CardHeader className="text-center items-center space-y-3">
            <div className="flex justify-center items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Cargando pedido…</span>
            </div>
            <Skeleton className="h-16 w-16 rounded-full mb-4 transition-all duration-700 ease-in-out" />
            <Skeleton className="h-8 w-3/5 mb-2 transition-all duration-700 ease-in-out" />
            <Skeleton className="h-6 w-4/5 mb-1 transition-all duration-700 ease-in-out" />
            <Skeleton className="h-4 w-1/2 mb-1 transition-all duration-700 ease-in-out" />
          </CardHeader>
  
          <Separator />
  
          <CardContent className="pt-6 space-y-6">
            <Skeleton className="h-6 w-1/3 mb-3 transition-all duration-700 ease-in-out" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                  <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                  <div className="flex-grow space-y-1.5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-16 flex-shrink-0" />
                </div>
              ))}
            </div>
  
            <Separator />
  
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
          </CardContent>
  
          <CardFooter className="flex justify-center gap-4 pt-6 border-t">
            <Skeleton className="h-10 w-36 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardFooter>
        </Card>
      </div>
    );
  }

const renderOrderStatus = (status: string) => {
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold";
  switch (status.toLowerCase()) {
    case 'pending':
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pendiente</span>;
    case 'processing':
      return <span className={`${base} bg-blue-100 text-blue-800`}>Procesando</span>;
    case 'shipped':
      return <span className={`${base} bg-indigo-100 text-indigo-800`}>Enviado</span>;
    case 'delivered':
      return <span className={`${base} bg-green-100 text-green-800`}>Entregado</span>;
    case 'cancelled':
      return <span className={`${base} bg-red-100 text-red-800`}>Cancelado</span>;
    default:
      return <span className={`${base} bg-gray-200 text-gray-800 capitalize`}>{status}</span>;
  }
};

const renderPaymentMethod = (method?: string | null) => {
  if (!method) return <span className="text-muted-foreground">N/A</span>;
  switch (method) {
    case 'card':
      return <span className="flex items-center gap-1"><CreditCard className="h-4 w-4" />Tarjeta</span>;
    case 'paypal':
      return <span className="flex items-center gap-1"><FaPaypal className="h-4 w-4 text-[#00457C]" />PayPal</span>;
    case 'crypto':
      return <span className="flex items-center gap-1"><FaBitcoin className="h-4 w-4 text-orange-500" />Criptomoneda</span>;
    case 'other':
      return (
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 1 0 10 10M12 2a10 10 0 0 0-10 10" /></svg>
          Transferencia
        </span>
      );
    default:
      return <span className="capitalize">{method}</span>;
  }
};

export default function OrderConfirmationPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login?redirect=/orders/confirmation" + (orderId ? `?orderId=${orderId}` : ''));
      return;
    }

    async function loadOrder() {
      if (!currentUser || !orderId) {
        setError("Faltan datos de usuario o de orden.");
        setIsLoading(false);
        router.replace('/orders');
        return;
      }

      try {
        setIsLoading(true);
        const fetchedOrder = await getOrderById(orderId);
        if (fetchedOrder?.userId === currentUser.id) {
          setOrder(fetchedOrder);
        } else {
          setError("No tienes permiso para ver esta orden.");
          router.replace('/orders');
        }
      } catch {
        setError("Error al cargar los datos de la orden.");
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la orden." });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) loadOrder();
  }, [currentUser, authLoading, router, orderId, toast]);

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

  if (isLoading || authLoading) return <OrderConfirmationSkeleton />;

  if (error) return <div className="container mx-auto px-4 py-12 text-center text-destructive">{error}</div>;

  if (!order) return <div className="container mx-auto px-4 py-12 text-center">Orden no encontrada. Redirigiendo…</div>;

  
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">¡Orden Confirmada!</CardTitle>
          <CardDescription className="text-muted-foreground">Gracias, {currentUser?.username || currentUser?.firstName}.</CardDescription>
          <div className="mt-2 text-sm text-muted-foreground space-y-1">
            <p>Orden <span className="font-bold">#{order.id.substring(0, 8)}</span></p>
            <p>Fecha: <span className="font-bold">{new Date(order.orderDate).toLocaleDateString()}</span></p>
            <p className="flex items-center gap-2">Estado: {renderOrderStatus(order.status)}</p>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Resumen de la Orden</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                    )}
                  </div>
                  <div className="flex-grow space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                    {renderCustomizationDetails(item.customizationDetails)}
                    {item.giftWrap && <p className="text-xs text-primary flex items-center gap-1"><Gift className="h-3 w-3" />Envoltura de regalo</p>}
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-sm space-y-1">
            <Separator />
            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {Number(order.giftWrapTotal) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Envoltura</span><span>+ ${order.giftWrapTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground"><span>Envío</span><span>Gratis</span></div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </section>

          <section className="text-sm space-y-2">
            <Separator />
            <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Dirección de Envío</h4>
                <p className="text-muted-foreground">{order.shippingAddress}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dirección de Facturación</h4>
                <p className="text-muted-foreground">{order.billingAddress}</p>
              </div>
            </div>

            <Separator />
            <h4 className="font-semibold mt-2">Datos del Cliente</h4>
            <p className="text-muted-foreground">Correo: {order.billingEmail}</p>
            {currentUser?.phoneNumber && <p className="text-muted-foreground">Teléfono: {currentUser.phoneNumber}</p>}
            {(currentUser?.firstName || currentUser?.lastName) && (
              <p className="text-muted-foreground">
                Nombre: {currentUser.firstName} {currentUser.lastName}
              </p>
            )}

            <Separator />
            <h4 className="font-semibold mt-2">Método de Pago</h4>
            <div className="text-muted-foreground">{renderPaymentMethod(order.paymentMethod)}</div>
          </section>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t">
          <Link href="/products"><Button variant="outline">Seguir comprando</Button></Link>
          <Link href="/orders"><Button><Package className="mr-2 h-4 w-4" />Ver mis órdenes</Button></Link>
        </CardFooter>
      </Card>
    </div>
  );
}
