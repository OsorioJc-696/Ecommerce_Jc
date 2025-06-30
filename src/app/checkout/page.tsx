'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, User, AlertTriangle, Info, ArrowRight, ArrowLeft, Gift, Loader2 } from 'lucide-react';
import { FaPaypal, FaBitcoin } from 'react-icons/fa';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import { processOrderAction } from './actions';
import { FaQrcode, FaMobileAlt } from 'react-icons/fa';
import { SiVisa, SiMastercard } from 'react-icons/si';


const billingSchema = z.object({
  billingAddress: z.string().min(1, 'Billing address is required').refine(val => !/[<>{}]/.test(val), 'Invalid characters used'),
  billingEmail: z.string().email('Invalid email address'),
});

const paymentMethodSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'crypto', 'yape', 'plin', 'tunki', 'other'], {
    required_error: 'Por favor seleccione un método de pago.',
  }),
});

const cardPaymentSchema = z.object({
  cardNumber: z
    .string()
    .length(16, 'Card number must be 16 digits')
    .regex(/^\d{16}$/, 'Card number must contain only digits'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid format (MM/YY)')
    .refine(val => {
      const [month, year] = val.split('/');
      const expiry = new Date(parseInt(`20${year}`, 10), parseInt(month, 10) - 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expiry >= today;
    }, 'Card has expired'),
  cvv: z.string().length(3, 'CVV must be 3 digits').regex(/^\d{3}$/, 'CVV must contain only digits'),
  postalCode: z.string().length(5, 'Postal code must be 5 digits').regex(/^\d{5}$/, 'Postal code must contain only digits'),
});

const checkoutSchema = z
  .object({
    billingAddress: z.string().min(1, 'Billing address is required').refine(val => !/[<>{}]/.test(val), 'Invalid characters used'),
    billingEmail: z.string().email('Invalid email address'),
    paymentMethod: z.enum(['card', 'paypal', 'crypto', 'yape', 'plin', 'tunki', 'other'], {
      required_error: 'Please select a payment method.',
    }),
    // Estos campos estarán presentes siempre, pero se validan condicionalmente más abajo
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'card') {
      if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber)) {
        ctx.addIssue({
          path: ['cardNumber'],
          code: z.ZodIssueCode.custom,
          message: 'Card number must be 16 digits',
        });
      }

      if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
        ctx.addIssue({
          path: ['expiryDate'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid expiry format (MM/YY)',
        });
      } else {
        const [month, year] = data.expiryDate.split('/');
        const expiry = new Date(parseInt(`20${year}`, 10), parseInt(month, 10) - 1);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiry < today) {
          ctx.addIssue({
            path: ['expiryDate'],
            code: z.ZodIssueCode.custom,
            message: 'Card has expired',
          });
        }
      }

      if (!data.cvv || !/^\d{3}$/.test(data.cvv)) {
        ctx.addIssue({
          path: ['cvv'],
          code: z.ZodIssueCode.custom,
          message: 'CVV must be 3 digits',
        });
      }

      if (!data.postalCode || !/^\d{5}$/.test(data.postalCode)) {
        ctx.addIssue({
          path: ['postalCode'],
          code: z.ZodIssueCode.custom,
          message: 'Postal code must be 5 digits',
        });
      }
    }
  });


type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { cartItems, subtotal, giftWrapTotal, cartTotal, itemCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const isProfileIncomplete = !currentUser?.dni || !currentUser?.firstName || !currentUser?.lastName || !currentUser?.phoneNumber || !currentUser?.address;

  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingAddress: currentUser?.address || '',
      billingEmail: currentUser?.email || '',
      paymentMethod: undefined,
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      postalCode: '',
    },
  });

  const selectedPaymentMethod = methods.watch('paymentMethod');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (isProfileIncomplete && !window.location.search.includes('reason=incomplete')) {
      toast({
        variant: 'destructive',
        title: 'Profile Incomplete',
        description: 'Please complete your profile before proceeding to checkout.',
        duration: 5000,
      });
      router.replace('/profile?redirect=/checkout&reason=incomplete');
      return;
    }
    if (itemCount === 0 && !isProcessing) {
      const timer = setTimeout(() => {
        if (itemCount === 0 && !isProcessing) {
          toast({ title: 'Cart Empty', description: 'Your cart is empty. Redirecting...' });
          router.replace('/cart');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentUser, authLoading, router, itemCount, toast, isProfileIncomplete, isProcessing]);

  useEffect(() => {
    if (currentUser) {
      methods.reset({
        billingAddress: currentUser.address || '',
        billingEmail: currentUser.email || '',
        paymentMethod: methods.getValues('paymentMethod') || undefined,
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        postalCode: '',
      }, { keepValues: true });
    }
  }, [currentUser, methods]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in to complete your purchase.' });
      return;
    }
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const paymentSuccessful =
      data.paymentMethod !== 'card' || (data.cardNumber && data.cardNumber.length === 16);
    

    if (paymentSuccessful) {
      const orderSummary = {
        subtotal,
        giftWrapTotal,
        total: cartTotal,
        shippingAddress: currentUser.address || data.billingAddress,
        billingAddress: data.billingAddress,
        billingEmail: data.billingEmail,
        paymentMethod: data.paymentMethod,
      };

      const itemsData = cartItems.map(item => ({
        productId: parseInt(item.id, 10),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customizationDetails: item.customizationDetails,
        giftWrap: item.giftWrap,
        image: item.image,
      }));

      const result = await processOrderAction(currentUser.id, itemsData, orderSummary);

      if (result.success && result.orderId) {
        toast({
          title: 'Payment Successful!',
          description: `Your order #${result.orderId} has been placed.`,
        });
        clearCart();
        router.push(`/orders/confirmation?orderId=${result.orderId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Order Processing Failed',
          description: result.message,
        });
        setIsProcessing(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: `Could not process payment using ${data.paymentMethod}. Please check details or try another method.`,
      });
      setIsProcessing(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Enter your billing address and email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={methods.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="billingEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={methods.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="card" />
                          </FormControl>
                          <FormLabel className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <SiVisa size={24} />
                              <SiMastercard size={24} />
                            </div>
                            <span>Tarjeta de Crédito/Débito</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="yape" />
                          </FormControl>
                          <FormLabel className="flex items-center space-x-1">
                            <FaQrcode size={16} />
                            <span>Yape</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="plin" />
                          </FormControl>
                          <FormLabel className="flex items-center space-x-1">
                            <FaMobileAlt size={16} />
                            <span>Plin</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="tunki" />
                          </FormControl>
                          <FormLabel className="flex items-center space-x-1">
                            <FaMobileAlt size={16} />
                            <span>Tunki</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="paypal" />
                          </FormControl>
                          <FormLabel className="flex items-center space-x-1">
                            <FaPaypal size={16} />
                            <span>PayPal</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
  
          {selectedPaymentMethod === 'card' && (
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={methods.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="4111111111111111" maxLength={16} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={methods.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry (MM/YY)</FormLabel>
                        <FormControl>
                          <Input placeholder="12/25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" maxLength={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={methods.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="90210" maxLength={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          )}
          {(selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin' || selectedPaymentMethod === 'tunki') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Pago con {selectedPaymentMethod.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-center text-base">
                    Escanea el código QR o utiliza el número de celular
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="rounded-lg overflow-hidden shadow-lg p-4 bg-white">
                      {selectedPaymentMethod === 'yape' && (
                          <Image
                              src="/pago/yape.jpg"
                              alt="Código QR Yape"
                              width={300}
                              height={300}
                              className="object-contain"
                          />
                      )}
                      {selectedPaymentMethod === 'plin' && (
                          <Image
                              src="/pago/plin.jpg"
                              alt="Código QR Plin"
                              width={300}
                              height={300}
                              className="object-contain"
                          />
                      )}
                      {selectedPaymentMethod === 'tunki' && (
                          <div className="w-[340px] min-h-[360px] bg-gradient-to-br from-white via-blue-50 to-gray-100 rounded-2xl border border-gray-200 shadow-xl p-6 flex flex-col items-center justify-between space-y-4 transition-all duration-300 ease-in-out">

                            <h3 className="text-xl font-semibold text-gray-800">Paga con Tunki</h3>

                            <div className="relative bg-white border border-gray-300 rounded-xl shadow-md p-5 transition-transform hover:scale-[1.02]">
                              <FaQrcode size={200} className="text-blue-600" />
                              {/* Loading shimmer or overlay badge could go here */}
                            </div>

                            <div className="text-center space-y-1">
                              <p className="text-base text-gray-700 font-medium">Escanea el código QR</p>
                              <p className="text-sm text-gray-500">Abre tu app Tunki y escanea para completar tu pago de forma segura.</p>
                            </div>

                            <button
                                type="button"
                                className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                            >
                              Ya he pagado
                            </button>
                          </div>
                      )}

                    </div>

                    <div className="text-center space-y-2">
                      <p className="font-medium text-gray-700">Número de celular:</p>
                      <p className="text-2xl font-bold text-primary">918-405-247</p>
                    </div>

                    <Alert className="bg-primary/5 border-primary/10">
                      <Info className="h-5 w-5 text-primary" />
                      <AlertTitle className="font-semibold text-primary">
                        Instrucciones de Pago
                      </AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Abre tu aplicación de {selectedPaymentMethod.toUpperCase()}</li>
                          <li>Escanea el código QR o busca el número mostrado</li>
                          <li>Ingresa el monto exacto: <span className="font-semibold">S/. {cartTotal.toFixed(2)}</span></li>
                          <li>Completa el pago y guarda el comprobante</li>
                        </ol>
                      </AlertDescription>
                    </Alert>

                    <div className="w-full p-4 bg-primary/5 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        Una vez realizado el pago, haz clic en "Completar Orden" para finalizar tu compra
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
  
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
  ;
}
