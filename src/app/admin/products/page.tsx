'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getAllProducts, type Product, deleteProduct } from '@/lib/products'; // Assuming functions exist and use Prisma
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cva } from "class-variance-authority"; // Import cva
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProducts() {
        setIsLoading(true);
        try {
            const fetchedProducts = await getAllProducts(); // Now async
            setProducts(fetchedProducts);
        } catch (error) {
             console.error("Failed to load products:", error);
             toast({ variant: "destructive", title: "Error", description: "Could not load products." });
        } finally {
            setIsLoading(false);
        }
    }
    loadProducts();
  }, [toast]); // Add toast to dependencies

   const handleDeleteProduct = async (productId: number) => { // Use number for ID
       try {
           await deleteProduct(productId); // Now async
           setProducts(prev => prev.filter(p => p.id !== productId));
           toast({ title: "Product Deleted", description: `Product ID ${productId} removed.` });
       } catch (error) {
           console.error("Failed to delete product:", error);
           toast({ variant: "destructive", title: "Deletion Failed", description: `Could not delete product ID ${productId}. Check console for details.` });
       }
   };

  if (isLoading) {
    return <AdminProductsSkeleton />; // Show skeleton while loading
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Products</h1>
             <Link href="/admin/products/new">
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </Link>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Product List</CardTitle>
                <CardDescription>View, edit, or delete products.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden w-[100px] sm:table-cell">
                                <span className="sr-only">Image</span>
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                             <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="hidden sm:table-cell">
                                     <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="48px"
                                                data-ai-hint={`${product.category} small`}
                                            />
                                        ) : (
                                             <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{product.category}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">${Number(product.price).toFixed(2)}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                     <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                     </Badge>
                                </TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                 <Link href={`/admin/products/edit/${product.id}`} passHref>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4"/> Edit
                                                    </DropdownMenuItem>
                                                 </Link>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                 </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the product
                                                    &quot;{product.name}&quot;. Related reviews might also be affected depending on database setup.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                     onClick={() => handleDeleteProduct(product.id)} // Pass numeric ID
                                                     className={cn(buttonVariants({ variant: "destructive" }))}
                                                 >
                                                     Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {products.length === 0 && !isLoading && ( // Show only if not loading and empty
                     <div className="text-center text-muted-foreground py-8">No products found.</div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}

// Helper function (can be moved to utils) - Keep this if used elsewhere
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline", }, size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10", }, }, defaultVariants: { variant: "default", size: "default", }, }
)

// Skeleton Component for Loading State
function AdminProductsSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-32" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableHead>
                                <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => ( // Skeleton for 5 rows
                                <TableRow key={i}>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
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
