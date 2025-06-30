'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep if needed
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { getProductById, updateProduct, getCategories, type Product } from '@/lib/products'; // Use Prisma functions
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Added Loader2
import { Skeleton } from '@/components/ui/skeleton';

// Zod schema (can be same as 'new' page, ensure optional fields match Prisma)
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  image: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  customizable: z.enum(['computer', 'camera']).optional().nullable(),
  baseSpecs: z.any().optional(), // Keep as any or define schema
  additionalImages: z.array(z.string().url()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]); // State for categories

  // Ensure productId is a number
  const productIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = parseInt(productIdParam, 10); // Convert to number

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { // Default values will be overridden by useEffect
      name: '', description: '', price: 0, category: '', stock: 0, image: '',
      customizable: undefined, baseSpecs: undefined, additionalImages: [],
    },
  });

  // Fetch categories and product data
  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        if (isNaN(productId)) {
             toast({ variant: "destructive", title: "Error", description: "Invalid product ID." });
             router.push('/admin/products');
             setIsLoading(false);
             return;
        }
        try {
            // Fetch categories
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);

            // Fetch product
            const fetchedProduct = await getProductById(productId); // Now async
            if (fetchedProduct) {
                setProduct(fetchedProduct);
                // Populate form with existing product data
                form.reset({
                  name: fetchedProduct.name,
                  description: fetchedProduct.description || '', // Handle null description
                  price: Number(fetchedProduct.price), // Ensure price is number
                  category: fetchedProduct.category,
                  stock: fetchedProduct.stock,
                  image: fetchedProduct.image || '', // Handle null image
                  customizable: fetchedProduct.customizable || null, // Use null if undefined
                  baseSpecs: fetchedProduct.baseSpecs as any, // Adjust if needed based on actual type
                  additionalImages: fetchedProduct.additionalImages as string[] || [], // Ensure array
                });
            } else {
                toast({ variant: "destructive", title: "Error", description: "Product not found." });
                router.push('/admin/products');
            }
        } catch (error) {
             console.error("Failed to load data:", error);
             toast({ variant: "destructive", title: "Error", description: "Could not load product or categories." });
             router.push('/admin/products'); // Redirect on error
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, [productId, form, router, toast]); // Add dependencies


  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
        // Prepare data for Prisma update
        const updateData = {
            ...data,
            // Ensure baseSpecs and additionalImages are correctly formatted if needed (Prisma might handle it)
             baseSpecs: data.baseSpecs ? JSON.stringify(data.baseSpecs) : undefined, // Example stringification
             additionalImages: data.additionalImages || [],
        };

      await updateProduct(product.id, updateData); // Now async
      toast({ title: "Product Updated", description: `"${data.name}" updated successfully.` });
      router.push('/admin/products');
      router.refresh(); // Refresh data
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update product. Check console." });
      setIsSubmitting(false); // Keep form enabled on error
    }
  };

   if (isLoading) return <EditProductSkeleton />;
   if (!product) return <div className="flex items-center justify-center h-64">Product not found.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
       <div className="flex items-center gap-4">
         <Link href="/admin/products"><Button variant="outline" size="icon" className="h-7 w-7"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back</span></Button></Link>
         <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Edit: {product.name}</h1>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle>Product Details</CardTitle><CardDescription>Update information.</CardDescription></CardHeader>
            <CardContent className="grid gap-6">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., Gaming Laptop Pro" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                          <SelectContent>{categories.length === 0 && <SelectItem value="" disabled>Loading...</SelectItem>}{categories.map((cat)=>(<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                        </Select><FormMessage/>
                      </FormItem> )}/>
                 <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="999.99" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                 <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" step="1" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem> )}/>
               </div>
              <FormField control={form.control} name="image" render={({ field }) => ( <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://source.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="customizable" render={({ field }) => (
                    <FormItem><FormLabel>Customizable Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Not Customizable" /></SelectTrigger></FormControl>
                          <SelectContent>
                             <SelectItem value="null">Not Customizable</SelectItem>
                             <SelectItem value="computer">Computer</SelectItem>
                             <SelectItem value="camera">Camera</SelectItem>
                          </SelectContent>
                        </Select><FormMessage/>
                      </FormItem> )}/>
              {/* Add more fields if editable: additionalImages, baseSpecs */}
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t pt-6">
                 <Link href="/admin/products"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={isSubmitting}> {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"} </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Skeleton component (Keep existing skeleton)
function EditProductSkeleton() { return (<div className="flex flex-col gap-6 max-w-3xl mx-auto animate-pulse"><div className="flex items-center gap-4"><Skeleton className="h-7 w-7 rounded-md" /><Skeleton className="h-6 w-48" /></div><Card><CardHeader><Skeleton className="h-6 w-1/2 mb-1" /><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent className="grid gap-6"><div className="space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div><div className="space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-20 w-full"/></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="space-y-2"><Skeleton className="h-4 w-1/2"/><Skeleton className="h-10 w-full"/></div><div className="space-y-2"><Skeleton className="h-4 w-1/2"/><Skeleton className="h-10 w-full"/></div><div className="space-y-2"><Skeleton className="h-4 w-1/2"/><Skeleton className="h-10 w-full"/></div></div><div className="space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-10 w-full"/></div></CardContent><CardFooter className="justify-end gap-2 border-t pt-6"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-32" /></CardFooter></Card></div>); }
