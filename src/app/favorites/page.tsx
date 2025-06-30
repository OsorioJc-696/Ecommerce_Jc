'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductList } from '@/components/products/product-list';
import { getProductById, type Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export default function FavoritesPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?redirect=/favorites');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    async function loadFavorites() {
      if (!currentUser?.favoriteProductIds?.length) {
        setFavoriteProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const ids = currentUser.favoriteProductIds
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id));

        const results = await Promise.allSettled(ids.map(getProductById));
        const loaded = results
          .filter((r) => r.status === 'fulfilled' && r.value)
          .map((r) => (r as PromiseFulfilledResult<Product>).value);

        setFavoriteProducts(loaded);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your favorite items.' });
        setFavoriteProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser) loadFavorites();
    else if (!authLoading) setIsLoading(false);
  }, [currentUser, authLoading, toast]);

  if (authLoading || isLoading) return <FavoritesSkeleton />;
  if (!currentUser) return <div className="container mx-auto px-4 py-12 text-center">Redirecting to login...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Heart className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            My Favorites
            {favoriteProducts.length > 0 && (
              <span className="inline-block text-sm font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                {favoriteProducts.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Products you saved for later.</p>
        </div>
      </div>

      {favoriteProducts.length > 0 ? (
        <ProductList products={favoriteProducts} />
      ) : (
        <Card className="max-w-xl mx-auto text-center border border-border shadow-sm">
          <CardHeader>
            <CardTitle>No Favorites Yet</CardTitle>
            <CardDescription>Click the heart ♡ on products to save them here.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground">Your favorites list is empty.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden">
              <Skeleton className="h-full w-full" />
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center border-t">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
