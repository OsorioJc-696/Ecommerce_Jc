'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import * as Tooltip from '@radix-ui/react-tooltip';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Product } from '@/lib/products';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Heart, Cog, PackageX, PackageCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { currentUser, addFavorite, removeFavorite } = useAuth();
  const { toast } = useToast();

  const isFavorite = currentUser?.favoriteProductIds?.includes(product.id.toString()) ?? false;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: 'This item is currently unavailable.',
      });
      return;
    }
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to manage favorites.',
      });
      return;
    }
    isFavorite ? removeFavorite(product.id) : addFavorite(product.id);
  };

  const handleCustomizeClick = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: 'Cannot customize an out-of-stock item.',
      });
    }
  };

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden bg-card text-card-foreground border border-border h-full transition-shadow hover:shadow-lg group rounded-lg',
        isOutOfStock && 'opacity-60 cursor-not-allowed'
      )}
      tabIndex={0}
      role="group"
      aria-label={`Product card for ${product.name}`}
    >
      <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <Link href={`/products/${product.id}`} aria-label={`View details for ${product.name}`} className="block w-full h-full">
          <Image
            src={product.image ?? '/fallback-image.jpg'}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={product.id <= 4}
            className={cn('transition-transform duration-300 group-hover:scale-105', isOutOfStock && 'grayscale')}
          />
        </Link>

        {currentUser && (
          <Tooltip.Provider delayDuration={100}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background/90 z-10',
                    isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={handleToggleFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={8}
                  className="bg-popover text-popover-foreground px-2 py-1 text-sm rounded shadow-md"
                >
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}

        {product.customizable && (
          <Badge className="absolute bottom-2 left-2 bg-secondary/80 backdrop-blur-md text-xs font-medium px-2 py-0.5 z-10 flex items-center gap-1 rounded">
            <Cog className="h-3 w-3" /> Customizable
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 left-2 z-10 rounded">
            Out of Stock
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors text-center">
            {product.name}
          </CardTitle>
        </Link>

        <div
          className={cn(
            'flex justify-between items-center font-medium text-sm',
            isOutOfStock ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-1">
            {isOutOfStock ? <PackageX className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
            <span>{product.stock}</span>
          </div>
<div className="text-xl font-bold text-foreground">${Number(product.price).toFixed(2)}</div>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t mt-auto flex justify-center items-center rounded-b-lg">
        {product.customizable ? (
          <Link href={`/products/${product.id}?customize=true`}>
            <Button
              size="sm"
              variant={isOutOfStock ? 'secondary' : 'outline'}
              className={cn(!isOutOfStock && 'border-primary text-primary hover:bg-primary/10')}
              disabled={isOutOfStock}
              onClick={handleCustomizeClick}
              aria-label="Customize product"
            >
              <Cog className="h-4 w-4 mr-1" />
              Customize
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            data-testid="add-to-cart-button"
          >
            {isOutOfStock ? <PackageX className="h-4 w-4 mr-1" /> : <ShoppingCart className="h-4 w-4 mr-1" />}
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
