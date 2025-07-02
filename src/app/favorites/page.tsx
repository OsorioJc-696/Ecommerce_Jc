'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductList } from '@/components/products/product-list';
import { type Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export default function FavoritesPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Redirección si no hay usuario
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login?redirect=/favorites');
    }
  }, [authLoading, currentUser, router]);

  // Cargar favoritos
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/favorites', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('No se pudieron cargar los favoritos');

        const data = await res.json();
        const products = data.favorites.map((f: any) => f.product);
        setFavorites(products);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Hubo un problema al cargar tus productos favoritos.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchFavorites();
    else if (!authLoading) setLoading(false);
  }, [authLoading, currentUser, toast]);

  // Loading skeleton
  if (authLoading || loading) return <FavoritesSkeleton />;
  if (!currentUser) return <div className="text-center py-12">Redireccionando...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Heart className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Favoritos
            {favorites.length > 0 && (
              <span className="inline-block text-sm font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Productos que marcaste como favoritos.</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <ProductList products={favorites} />
      ) : (
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader>
            <CardTitle>No hay favoritos</CardTitle>
            <CardDescription>Aún no has guardado ningún producto.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Explora productos y haz clic en ♡ para guardarlos aquí.</p>
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
