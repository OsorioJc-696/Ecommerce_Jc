'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import { getProductById, type Product, type Review, addProductReview } from '@/lib/products'; // Import Review type and addProductReview
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Minus, Plus, Cog, CheckCircle, AlertCircle, PackageX, PackageCheck, Gift, Star, MessageSquare, Loader2 } from 'lucide-react'; // Added Loader2
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/auth-context';
import { Heart } from 'lucide-react';


// --- Customization Options (Keep existing options) ---
const computerProcessors = ['Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7'];
const computerOS = ['Windows 11', 'Linux (Ubuntu)', 'No OS'];
const computerSSDs = ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'];
const computerRAMOptions = [4, 8, 12, 16];
const cameraLenses = ['Nikon 18-55mm', 'Nikon 50mm f/1.8', 'Sony 35mm f/1.8', 'Kit Lens Only'];
const cameraMemoryCardOptions = [1, 2, 4];
const MAX_CAMERA_MEMORY = 5;

interface ComputerCustomization {
    processor: string;
    os: string;
    ssd: string;
    ram: number;
}
interface CameraCustomization {
    lens: string;
    extraBatteries: number;
    memoryCardSize: number;
}
type CustomizationState = ComputerCustomization | CameraCustomization | null;

// --- Price Calculation (Keep existing functions) ---
const calculateComputerPrice = (basePrice: number, config: ComputerCustomization): { finalPrice: number, error?: string } => {
    let price = basePrice; let error: string | undefined = undefined;
    if (config.ram >= 4 && config.ram <= 8) price += 50;
    else if (config.ram >= 9 && config.ram <= 16) price += 150;
    else if (config.ram < 4 || config.ram > 16) return { finalPrice: basePrice, error: `RAM size ${config.ram}GB is not supported. Please select between 4GB and 16GB.` };
    const isIntel = config.processor.toLowerCase().includes('intel'); const isAMD = config.processor.toLowerCase().includes('amd'); const isLinux = config.os.toLowerCase().includes('linux');
    if (isIntel && isLinux) price *= 0.95; else if (isAMD && isLinux) price *= 0.90;
    return { finalPrice: price, error };
};
const calculateCameraPrice = (basePrice: number, config: CameraCustomization): { finalPrice: number, error?: string } => {
    let price = basePrice; let error: string | undefined = undefined;
    if (config.memoryCardSize >= 1 && config.memoryCardSize < MAX_CAMERA_MEMORY) price += 80;
    else if (config.memoryCardSize >= MAX_CAMERA_MEMORY) return { finalPrice: basePrice, error: `Memory card size ${config.memoryCardSize}GB is not supported. Select 1GB-${MAX_CAMERA_MEMORY - 1}GB.` };
    else if (config.memoryCardSize < 1) return { finalPrice: basePrice, error: `Memory card size ${config.memoryCardSize}GB is not supported. Select 1GB or more.` };
    const isSonyLens = config.lens.toLowerCase().includes('sony'); const isNikonLens = config.lens.toLowerCase().includes('nikon'); const hasExtraBatteries = config.extraBatteries >= 2;
    if (isSonyLens && hasExtraBatteries) price *= 0.95; else if (isNikonLens && hasExtraBatteries) price *= 0.90;
    price += config.extraBatteries * 30;
    return { finalPrice: price, error };
};

// --- Review Form State ---
interface ReviewFormData {
    rating: number;
    comment: string;
}

// --- Server Action for Adding Review ---
async function addReviewAction(
    productId: number,
    author: string, // In real app, use userId
    rating: number,
    comment: string
): Promise<{ success: boolean; message: string; review?: Review }> {

     if (rating === 0) return { success: false, message: "Please select a star rating." };
     if (!comment.trim()) return { success: false, message: "Please enter your review comment." };

    try {
        const newReview = await addProductReview(productId, {
          author, rating, comment,
          authorId: 0
        });
        // Optionally trigger revalidation if using Next.js cache tags
        // revalidateTag(`product-${productId}-reviews`);
        return { success: true, message: "Review submitted successfully!", review: newReview };
    } catch (error) {
        console.error("Error submitting review via action:", error);
        return { success: false, message: "Failed to submit review." };
    }
}


export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currentUser, addFavorite, removeFavorite } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [customization, setCustomization] = useState<CustomizationState>(null);
  const [priceDetails, setPriceDetails] = useState<{ finalPrice: number, error?: string } | null>(null);
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Allow null initially
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({ rating: 0, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Ensure productId is a number
  const productIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = useMemo(() => parseInt(productIdParam!, 10), [productIdParam]);

  const isCustomizing = searchParams.get('customize') === 'true';
  const isOutOfStock = useMemo(() => product?.stock === 0, [product]);
  const isFavorite = useMemo(() => currentUser?.favoriteProductIds?.includes(String(productId)) ?? false, [currentUser, productId]);


  // Fetch product data
  useEffect(() => {
    if (isNaN(productId)) {
        setIsLoading(false);
        notFound(); // If ID is not a valid number
        return;
    }
    setIsLoading(true);
    getProductById(productId)
      .then(foundProduct => {
        if (foundProduct) {
            setProduct({
              ...foundProduct,
              rating: foundProduct.rating !== null && typeof foundProduct.rating === 'number'
                ? new (require('decimal.js').Decimal)(foundProduct.rating)
                : foundProduct.rating,
              price: foundProduct.price !== null && typeof foundProduct.price === 'number'
                ? new (require('decimal.js').Decimal)(foundProduct.price)
                : foundProduct.price
            });
            setSelectedImage(foundProduct.image); // Set initial main image
            setQuantity(foundProduct.stock > 0 ? 1 : 0);
            setReviews(
              (foundProduct.reviews || []).map(r => ({
                ...r,
                author: r.author ?? '',
              }))
            );

            // Initialize customization
            if (foundProduct.customizable && isCustomizing && foundProduct.stock > 0) {
                const baseSpecs = foundProduct.baseSpecs as any; // Cast baseSpecs
                 if (foundProduct.customizable === 'computer') {
                    setCustomization({
                        processor: baseSpecs?.processor || computerProcessors[0],
                        os: baseSpecs?.os || computerOS[0],
                        ssd: baseSpecs?.ssd || computerSSDs[0],
                        ram: baseSpecs?.ram || 8,
                    });
                 } else if (foundProduct.customizable === 'camera') {
                     setCustomization({
                        lens: baseSpecs?.lens || cameraLenses[0],
                        extraBatteries: 0,
                        memoryCardSize: 1,
                    });
                 }
            } else {
                 setCustomization(null);
            }

        } else {
          setProduct(null); setCustomization(null); setSelectedImage(null); setReviews([]);
          notFound(); // Product not found
        }
      })
      .catch(error => {
        console.error("Error fetching product:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load product details." });
        setProduct(null); // Ensure product state is null on error
        // Optional: redirect or show error message
      })
      .finally(() => setIsLoading(false));
  }, [productId, isCustomizing, toast]); // Add toast to dependency array


   // Calculate final price (Keep existing useEffect)
   useEffect(() => {
       if (product) {
           let details: { finalPrice: number, error?: string };
           if (customization && product.customizable) {
               if (product.customizable === 'computer') details = calculateComputerPrice(Number(product.price), customization as ComputerCustomization);
               else if (product.customizable === 'camera') details = calculateCameraPrice(Number(product.price), customization as CameraCustomization);
               else details = { finalPrice: Number(product.price) };
           } else {
               details = { finalPrice: Number(product.price) };
           }
           setPriceDetails(details);
       } else {
            setPriceDetails(null);
       }
   }, [product, customization]);


  // Handle customization change (Keep existing useCallback)
  const handleCustomizationChange = useCallback((field: string, value: string | number) => {
    setCustomization(prev => {
        if (!prev || !product) return null;
        let numericValue = value;
        if ((field === 'ram' || field === 'memoryCardSize' || field === 'extraBatteries')) {
            numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
            if (isNaN(numericValue as number)) return prev;
            setPriceDetails(pd => pd ? { ...pd, error: undefined } : null);
            if (product.customizable === 'computer' && field === 'ram' && (numericValue < 4 || numericValue > 16)) {
                setPriceDetails(pd => ({ finalPrice: Number(product.price), error: `RAM size ${numericValue}GB is not supported. Select 4GB-16GB.` }));
                return { ...prev, [field]: numericValue };
            }
            if (product.customizable === 'camera' && field === 'memoryCardSize' && (numericValue >= MAX_CAMERA_MEMORY || numericValue < 1)) {
                 setPriceDetails(pd => ({ finalPrice: Number(product.price), error: `Memory card size ${numericValue}GB is not supported. Select 1GB-${MAX_CAMERA_MEMORY - 1}GB.` }));
                 return { ...prev, [field]: numericValue };
            }
        } else {
            setPriceDetails(pd => pd ? { ...pd, error: undefined } : null);
        }
        return { ...prev, [field]: numericValue };
    });
}, [product]);


  // Loading and Not Found states
  if (isLoading) return <ProductDetailSkeleton isCustomizing={isCustomizing} />;
  if (!product || selectedImage === null) return null; // Render nothing if product fetch failed or still loading image state


   // Handle Quantity Change (Keep existing function)
    const handleQuantityChange = (newQuantity: number) => {
        const stock = product?.stock || 0;
        if (stock === 0) { setQuantity(0); return; }
        const validatedQuantity = Math.max(1, Math.min(newQuantity, stock));
        setQuantity(validatedQuantity);
        if (newQuantity > stock) toast({ variant: "destructive", title: "Stock Limit", description: `Only ${stock} items available.` });
        else if (newQuantity < 1) toast({ variant: "destructive", title: "Invalid Quantity", description: `Quantity must be at least 1.` });
    };

    // Handle Add to Cart (Keep existing function, ensure price is number)
    const handleAddToCart = () => {
        if (product && !priceDetails?.error && !isOutOfStock && quantity > 0) {
             const itemToAdd = {
                 ...product,
                 id: String(product.id), // Ensure ID is string for CartContext
                 price: priceDetails ? Number(priceDetails.finalPrice) : Number(product.price),
                 name: isCustomizing ? `${product.name} (Customized)` : product.name,
                 customizationDetails: isCustomizing ? customization : undefined,
                 giftWrap: includeGiftWrap,
                 image: selectedImage || product.image || '', // Ensure image is string
                 category: product.category,
                 // Pass string ID
             };
            addToCart(itemToAdd as any, quantity); // Cast needed if Product type mismatch
            toast({ title: "Added to cart", description: `${quantity} x ${itemToAdd.name} added.` });
        } else if (isOutOfStock) toast({ variant: "destructive", title: "Out of Stock" });
        else if (quantity <= 0) toast({ variant: "destructive", title: "Invalid Quantity" });
        else if (priceDetails?.error) toast({ variant: "destructive", title: "Invalid Configuration", description: priceDetails.error });
    };

    // Handle Toggle Favorite (Adjust for numeric ID if needed, using String(productId))
    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!currentUser) {
            toast({ variant: "destructive", title: "Login Required", description: "Please log in to manage favorites." });
            return;
        }
        const productIdStr = String(productId); // Ensure string ID for context function
        try {
            if (isFavorite) await removeFavorite(Number(productIdStr));
            else await addFavorite(Number(productIdStr));
        } catch (error) {
            // Error handled in auth context
        }
    };

    // Handle Customize Click (Keep existing function)
    const handleCustomizeClick = (e: React.MouseEvent) => {
        if (isOutOfStock) {
            e.preventDefault();
            toast({ variant: "destructive", title: "Out of Stock", description: "Cannot customize out-of-stock item." });
        }
    };

  // Handle Review Submit using Server Action
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to submit a review." });
      return;
    }
     // Frontend validation remains useful
     if (reviewForm.rating === 0) { toast({ variant: "destructive", title: "Rating Required", description: "Please select a star rating." }); return; }
     if (!reviewForm.comment.trim()) { toast({ variant: "destructive", title: "Comment Required", description: "Please enter your review comment." }); return; }

    setIsSubmittingReview(true);
    const result = await addReviewAction(productId, currentUser.username, reviewForm.rating, reviewForm.comment);
    setIsSubmittingReview(false);

    if (result.success && result.review) {
      setReviews(prev => [result.review!, ...prev]); // Add new review to local state
      setReviewForm({ rating: 0, comment: '' }); // Reset form
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
       // Consider re-fetching product data if rating needs to update immediately
       // Or update the product state directly if the action returns the updated average
       // await updateProductRating(productId); // Or call a function to refetch product
    } else {
      toast({ variant: "destructive", title: "Submission Failed", description: result.message });
    }
  };

   // Get all images (ensure additionalImages is array)
    const additionalImagesArray = Array.isArray(product.additionalImages) ? product.additionalImages : [];
    const allImages = [product.image, ...additionalImagesArray].filter(img => !!img) as string[]; // Filter out null/empty strings and assert as string[]

  // --- JSX Structure (Mostly unchanged, ensure productId usage is correct type) ---
  return (

    <div className="container mx-auto px-4 py-8   ">
      

  <div className="flex flex-col lg:flex-row gap-12 items-start mb-12">
         {/* Product Image Gallery */}
         <div className="w-full lg:w-1/2 flex flex-col gap-4 lg:sticky lg:top-20">
    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg border">
      <Image
        key={selectedImage}
        src={selectedImage}
        alt={product.name}
        fill
        sizes="(max-width: 900px) 100vw, 500px"
        priority
        className="transition-opacity duration-300 object-contain"
      />
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <span className="text-white text-xl font-semibold bg-destructive px-4 py-2 rounded">Out of Stock</span>
        </div>
      )}
    </div>

    {allImages.length > 1 && (
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {allImages.map((imgUrl, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(imgUrl)}
            className={cn(
              "relative aspect-square rounded-md overflow-hidden border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selectedImage === imgUrl ? 'ring-2 ring-primary ring-offset-2' : 'border-border hover:border-primary'
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={imgUrl}
              alt={`${product.name} thumbnail ${index + 1}`}
              fill
              sizes="100px"
              className={cn("object-cover", selectedImage !== imgUrl && 'opacity-75 hover:opacity-100')}
            />
          </button>
        ))}
      </div>
    )}
  </div>

        {/* Product Details & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
           {isCustomizing && customization && <p className="text-sm text-primary font-semibold flex items-center gap-1"><Cog className="h-4 w-4"/> Customizing</p>}

            {/* Rating Display */}
            {product.rating !== undefined && product.rating !== null && (
                <div className="flex items-center gap-2">
                    <div className="flex items-center">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={cn("h-5 w-5", star <= Math.round((product.rating as any).toNumber?.() ?? Number(product.rating))
          ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')}/>))}</div>
                    <span className="text-muted-foreground text-sm">({product.rating.toFixed(1)}) - {reviews.length} reviews</span>
                </div>
            )}

          <p className="text-lg text-muted-foreground">{product.description}</p>
          <div className={cn("flex items-center gap-2", isOutOfStock ? 'text-destructive' : 'text-green-600')}>{isOutOfStock ? <PackageX className="h-5 w-5" /> : <PackageCheck className="h-5 w-5" />}<span className="font-medium">{isOutOfStock ? 'Out of Stock' : `${product.stock} Available`}</span></div>
          <p className="text-3xl font-semibold">{priceDetails ? `$${priceDetails.finalPrice.toFixed(2)}` : 'Calculating...'}{isCustomizing && Number(product.price) !== priceDetails?.finalPrice && priceDetails && !priceDetails.error && (<span className="text-base line-through text-muted-foreground ml-2">${Number(product.price).toFixed(2)}</span>)}</p>
          {priceDetails?.error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Config Error</AlertTitle><AlertDescription>{priceDetails.error}</AlertDescription></Alert>)}

          {/* --- Customization Section --- */}
          {isCustomizing && customization && !isOutOfStock && (
            <Card className="border-border shadow-sm">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Cog className="h-5 w-5"/> Configure</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {product.customizable === 'computer' && (
                  <>
                    <CustomSelect label="Processor" value={(customization as ComputerCustomization).processor} onChange={(v) => handleCustomizationChange('processor', v)} options={computerProcessors}/>
                    <CustomSelect label="OS" value={(customization as ComputerCustomization).os} onChange={(v) => handleCustomizationChange('os', v)} options={computerOS}/>
                    <CustomSelect label="SSD" value={(customization as ComputerCustomization).ssd} onChange={(v) => handleCustomizationChange('ssd', v)} options={computerSSDs}/>
                    <CustomRadioGroup label="RAM (GB)" value={(customization as ComputerCustomization).ram.toString()} onChange={(v) => handleCustomizationChange('ram', v)} options={computerRAMOptions.map(r => ({ label: `${r} GB`, value: r.toString() }))} errorMessage={priceDetails?.error && priceDetails.error.includes("RAM") ? priceDetails.error : undefined}/>
                  </>
                )}
                {product.customizable === 'camera' && (
                  <>
                    <CustomSelect label="Lens" value={(customization as CameraCustomization).lens} onChange={(v) => handleCustomizationChange('lens', v)} options={cameraLenses}/>
                    <div className="space-y-2"><Label htmlFor="extraBatteries">Extra Batteries</Label><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => handleCustomizationChange('extraBatteries', Math.max(0, (customization as CameraCustomization).extraBatteries - 1))}><Minus className="h-4 w-4"/></Button><Input id="extraBatteries" type="number" value={(customization as CameraCustomization).extraBatteries} onChange={(e) => handleCustomizationChange('extraBatteries', e.target.value)} className="w-16 text-center" min="0" /><Button variant="outline" size="icon" onClick={() => handleCustomizationChange('extraBatteries', (customization as CameraCustomization).extraBatteries + 1)}><Plus className="h-4 w-4"/></Button></div></div>
                    <CustomRadioGroup label="Memory Card (GB)" value={(customization as CameraCustomization).memoryCardSize.toString()} onChange={(v) => handleCustomizationChange('memoryCardSize', v)} options={cameraMemoryCardOptions.map(m => ({ label: `${m} GB`, value: m.toString() }))} errorMessage={priceDetails?.error && priceDetails.error.includes("Memory card") ? priceDetails.error : undefined}/>
                  </>
                )}
                 <Separator />
                <p className="text-sm text-muted-foreground">Base Price: ${Number(product.price).toFixed(2)}</p>
              </CardContent>
            </Card>
          )}

          {/* Quantity & Gift Wrap */}
          {!isOutOfStock && (
             <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center space-x-4"><Label htmlFor="quantity" className="text-lg shrink-0">Qty:</Label><div className="flex items-center border rounded-md"><Button variant="outline" size="icon" className="rounded-r-none border-r-0 h-10 w-10" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}><Minus className="h-4 w-4" /></Button><Input id="quantity" type="number" min="1" max={product.stock} value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)} onBlur={(e) => {const v=parseInt(e.target.value,10); if(isNaN(v)||v<1)handleQuantityChange(1); else if(v>product.stock)handleQuantityChange(product.stock);}} className="w-16 text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"/><Button variant="outline" size="icon" className="rounded-l-none border-l-0 h-10 w-10" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></Button></div></div>
                 <div className="flex items-center space-x-2 pt-2 sm:pt-0"><Checkbox id="giftWrap " checked={includeGiftWrap} onCheckedChange={(c: any) => setIncludeGiftWrap(!!c)} disabled={isOutOfStock}/><Label htmlFor="giftWrap" className="text-sm font-medium cursor-pointer flex items-center gap-1 text-muted-foreground hover:text-foreground"><Gift className="h-4 w-4 text-primary"/> Gift wrap (+$10.00)</Label></div>
            </div>
           )}

          {/* Add to Cart Button */}
          <div className="flex items-center gap-4">
              <Button size="lg" onClick={handleAddToCart} className="flex-grow md:flex-grow-0" disabled={!!priceDetails?.error || isOutOfStock || quantity <= 0}>
                 {isOutOfStock ? <><PackageX className="mr-2 h-5 w-5" /> Out of Stock</>
                  : priceDetails?.error ? <><AlertCircle className="mr-2 h-5 w-5" /> Invalid Config</>
                  : quantity <= 0 ? <><AlertCircle className="mr-2 h-5 w-5" /> Select Qty</>
                  : <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>}
              </Button>
               {/* Favorite Button */}
              {currentUser && (
                  <Button variant="outline" size="icon" onClick={handleToggleFavorite} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                     <Heart className={cn("h-5 w-5", isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground')}/>
                  </Button>
              )}
          </div>

          <div className="border-t pt-6"><h3 className="text-lg font-semibold mb-2">Category</h3><p className="text-muted-foreground">{product.category}</p></div>
        </div>

      </div>

      
        <Separator className="my-12" />
         {/* Reviews Section */}
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
             <Card className="mb-8 border-border shadow-sm">
                 <CardHeader><CardTitle className="text-xl flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> Write Review</CardTitle></CardHeader>
                 <CardContent>
                     {currentUser ? (
                         <form onSubmit={handleReviewSubmit} className="space-y-4">
                             <div className="space-y-2"><Label>Rating</Label><div className="flex items-center">{[1,2,3,4,5].map(star => (<button key={star} type="button" onClick={()=>setReviewForm(p=>({...p, rating: star}))} className="focus:outline-none"><Star className={cn("h-6 w-6 cursor-pointer transition-colors", star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-400')}/></button>))}</div></div>
                             <div className="space-y-2"><Label htmlFor="reviewComment">Review</Label><Textarea id="reviewComment" placeholder={`Thoughts on ${product.name}?`} value={reviewForm.comment} onChange={(e) => setReviewForm(p => ({ ...p, comment: e.target.value }))} rows={4} required /></div>
                             <Button type="submit" disabled={isSubmittingReview}>{isSubmittingReview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : "Submit Review"}</Button>
                         </form>
                     ) : ( <p className="text-muted-foreground">Please <Link href="/login" className="text-primary underline">log in</Link> to write a review.</p> )}
                 </CardContent>
             </Card>

            {reviews.length > 0 ? (
                <div className="space-y-6">{reviews.map(review => (<Card key={review.id} className="border-border shadow-sm"><CardContent className="p-4 flex gap-4"><Avatar className="h-10 w-10 border"><AvatarFallback>{review.author.substring(0,2).toUpperCase()}</AvatarFallback></Avatar><div className="flex-grow"><div className="flex items-center justify-between mb-1"><p className="font-semibold">{review.author}</p><span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span></div><div className="flex items-center mb-2">{[1,2,3,4,5].map(star=>(<Star key={star} className={cn("h-4 w-4", star<=review.rating?'text-yellow-400 fill-yellow-400':'text-muted-foreground')}/>))}</div><p className="text-sm text-foreground/90">{review.comment}</p></div></CardContent></Card>))}</div>
            ) : ( <p className="text-muted-foreground text-center">No reviews yet.</p> )}
        </div>
    </div>
  );


 
}

// --- Reusable Customization Components (Keep existing components) ---
interface CustomSelectProps { label: string; value: string; onChange: (v: string) => void; options: string[]; }
function CustomSelect({ label, value, onChange, options }: CustomSelectProps) { const id = label.toLowerCase().replace(/\s+/g, '-'); return (<div className="space-y-2"><Label htmlFor={id}>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger id={id}><SelectValue placeholder={`Select ${label}`} /></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>); }
interface CustomRadioGroupProps { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; errorMessage?: string; }
function CustomRadioGroup({ label, value, onChange, options, errorMessage }: CustomRadioGroupProps) { const id = label.toLowerCase().replace(/\s+/g, '-'); return (<div className="space-y-2"><Label htmlFor={id} className={errorMessage?'text-destructive':''}>{label}</Label><RadioGroup id={id} value={value} onValueChange={onChange} className={cn("flex flex-wrap gap-4 pt-1", errorMessage&&'border border-destructive rounded-md p-2')}>{options.map(o=>(<div key={o.value} className="flex items-center space-x-2"><RadioGroupItem value={o.value} id={`${id}-${o.value}`}/><Label htmlFor={`${id}-${o.value}`} className="font-normal cursor-pointer">{o.label}</Label></div>))}</RadioGroup>{errorMessage && <p className="text-sm text-destructive mt-1">{errorMessage}</p>}</div>); }

// Skeleton component (Keep existing skeleton)
function ProductDetailSkeleton({ isCustomizing }: { isCustomizing?: boolean }) { return (<div className="container mx-auto px-4 py-8 animate-pulse"><div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12"><div className="flex flex-col gap-4 sticky top-20"><Skeleton className="relative aspect-square rounded-lg" /><div className="grid grid-cols-4 sm:grid-cols-5 gap-2">{[...Array(4)].map((_,i)=><Skeleton key={i} className="aspect-square rounded-md"/>)}</div></div><div className="flex flex-col space-y-6"><Skeleton className="h-10 w-3/4" />{isCustomizing && <Skeleton className="h-4 w-1/4" />}<div className="flex items-center gap-2"><Skeleton className="h-5 w-28" /><Skeleton className="h-4 w-24" /></div><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-5/6" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-8 w-1/4" />{isCustomizing && (<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div></CardContent></Card>)}<div className="flex flex-col sm:flex-row sm:items-center gap-6"><div className="flex items-center space-x-4"><Skeleton className="h-6 w-20" /><Skeleton className="h-10 w-32" /></div><Skeleton className="h-5 w-48" /></div><Skeleton className="h-12 w-full md:w-48" /><div className="border-t pt-6 space-y-2"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-5 w-1/3" /></div></div></div><Separator className="my-12" /><div className="max-w-4xl mx-auto"><Skeleton className="h-8 w-1/3 mb-6" /><Card className="mb-8"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-1/4" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-32" /></CardContent></Card><div className="space-y-6">{[1, 2].map(i => (<Card key={i}><CardContent className="p-4 flex gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-grow space-y-2"><div className="flex justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div></CardContent></Card>))}</div></div></div>); }
