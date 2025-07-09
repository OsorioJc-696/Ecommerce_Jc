
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart, type CartItem } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, Settings, Gift } from 'lucide-react'; // Added Settings and Gift icons
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // For customization details
import { Label } from '@/components/ui/label'; // Import Label
import { cn } from '@/lib/utils'; // Import cn
import { useToast } from '@/hooks/use-toast'; // Import useToast here
import { Checkbox } from '@/components/ui/checkbox';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, updateGiftWrap, clearCart, itemCount, subtotal, giftWrapTotal, cartTotal } = useCart();
  const { toast } = useToast(); // Get toast function

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    const quantity = Math.max(1, Math.min(newQuantity, item.stock)); // Ensure quantity is between 1 and stock
    if (quantity !== newQuantity) {
        if (newQuantity > item.stock) {
             toast({
                variant: "destructive",
                title: "Stock Limit Reached",
                description: `Only ${item.stock} of ${item.name} available.`,
            });
        } else {
            // This case (quantity < 1) might not be reachable if UI prevents it, but good to handle
            toast({
                variant: "destructive",
                title: "Invalid Quantity",
                description: `Quantity must be at least 1.`,
            });
        }
    }
    updateQuantity(item.cartItemId, quantity); // Use cartItemId
  };

   // Helper to display customization details nicely
   const renderCustomizationDetails = (details: any) => {
       if (!details) return null;
       return (
           <Accordion type="single" collapsible className="w-full text-xs mt-2">
               <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="py-1 text-muted-foreground hover:no-underline [&[data-state=open]>svg]:text-primary">
                       <span className="flex items-center gap-1"><Settings className="h-3 w-3"/> View Configuration</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2 pl-2 border-l border-dashed ml-2 text-muted-foreground space-y-0.5">
                        {Object.entries(details).map(([key, value]) => (
                        <p key={key}>
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value as React.ReactNode}
                        </p>
                        ))}
                    </AccordionContent>
               </AccordionItem>
           </Accordion>
       );
   };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {itemCount === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.cartItemId} 
              className="flex flex-col sm:flex-row items-start sm:items-center p-4 shadow-sm"
              data-testid="cart-item"> 
              {/* Use cartItemId */}
                 <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder-image.png'}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="128px"
                    data-ai-hint={`${item.category || 'product'} technology`} // Use category and general keyword
                  />
                </div>
                <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                   <div className="mb-4 sm:mb-0 flex-grow"> {/* Allow description and customization to take space */}
                    <Link href={`/products/${item.id}`}>
                      <h2 className="text-lg font-semibold hover:underline">{item.name}</h2>
                    </Link>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                     <p className="text-xs text-muted-foreground">Stock: {item.stock}</p> {/* Display stock */}
                    {/* Display Customization Details */}
                    {item.customizationDetails && renderCustomizationDetails(item.customizationDetails)}
                    {/* Gift Wrapping Checkbox */}
                     <div className="flex items-center space-x-2 mt-3">
                        <Checkbox
                            id={`giftWrap-${item.cartItemId}`}
                            checked={item.giftWrap}
                            onCheckedChange={(checked) => updateGiftWrap(item.cartItemId, !!checked)}
                            aria-label={`Gift wrap ${item.name}`}
                        />
                         <Label htmlFor={`giftWrap-${item.cartItemId}`} className="text-sm font-medium cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground">
                             <Gift className="h-4 w-4 text-primary"/> Gift wrap this item (+$10.00 per item)
                        </Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0 flex-shrink-0 self-end sm:self-start"> {/* Adjust alignment */}
                     {/* Quantity Control */}
                     <div className="flex items-center border rounded-md">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-r-none border-r-0 h-9 w-9"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                         aria-label="Decrease quantity"
                         disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.stock} // Add max attribute
                        value={item.quantity}
                         // Use handleQuantityChange to validate input
                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10) || 1)}
                        onBlur={(e) => { // Ensure quantity is valid on blur
                            const val = parseInt(e.target.value, 10);
                             if (isNaN(val) || val < 1) handleQuantityChange(item, 1);
                             else if (val > item.stock) handleQuantityChange(item, item.stock);
                        }}
                        className="w-12 text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-1"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-l-none border-l-0 h-9 w-9"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        aria-label="Increase quantity"
                         // Disable if quantity exceeds stock
                         disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.cartItemId)} // Use cartItemId
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
             <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-20"> {/* Make summary sticky */}
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                 {giftWrapTotal > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                        <span>Gift Wrapping</span>
                        <span>+ ${giftWrapTotal.toFixed(2)}</span>
                    </div>
                 )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span> {/* Or calculate shipping */}
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span> {/* Or calculate taxes */}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" className="w-full">
                    <Button className="w-full" size="lg" disabled={itemCount === 0}>
                        Proceed to Checkout
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
