'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductList } from '@/components/products/product-list';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/lib/products';
import { Decimal } from 'decimal.js';
import { useDebounce } from '@/hooks/use-debounce';
import { useDeferredValue } from 'react';

const PRODUCTS_PER_PAGE = 12;

export function ProductBrowser({
  showTitle = true,
  customizableToggle = true,
}: {
  showTitle?: boolean;
  customizableToggle?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomizableOnly, setShowCustomizableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchTerm, 400);

  const normalizeProduct = (p: any): Product => ({
    ...p,
    price: new Decimal(p.price),
    rating: p.rating != null ? new Decimal(p.rating) : null,
  });

  useEffect(() => {
  async function loadData() {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory,
        page: page.toString(),
        perPage: PRODUCTS_PER_PAGE.toString(),
      });

      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${query}`),
        fetch('/api/categories'),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const productData = await productsRes.json();
      const categoryResJson = await categoriesRes.json();

      const categoryNames = Array.isArray(categoryResJson.categories)
        ? categoryResJson.categories
        : [];

      setCategories(categoryNames);
      setProducts(
        Array.isArray(productData.products)
          ? productData.products.map(normalizeProduct)
          : []
      );
      setTotalPages(productData.totalPages || 1);
    } catch (error) {
      console.error('Failed to load store data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load store data.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  loadData();
}, [debouncedSearch, selectedCategory, page, toast]);


  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      !customizableToggle || !showCustomizableOnly || product.customizable
    );
  }, [products, showCustomizableOnly, customizableToggle]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // reset page
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1); // reset page
  };

  return (
    <div>
      {showTitle && (
        <h1 className="text-3xl font-semibold text-primary text-center mb-6">
          All Products
        </h1>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
       
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            
            className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-background shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-base"
            aria-label="Search products"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Select
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full pl-12 py-3 rounded-full border border-border bg-background shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-base">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border border-border">
  <SelectItem data-testid="category-option" value="all">All Categories</SelectItem>

  {categories.length === 0 && !isLoading && (
    <SelectItem value="no-categories" disabled>
      No categories found
    </SelectItem>
  )}

  {categories.map((category, idx) => (
    <SelectItem
  key={`${category}-${idx}`}
  value={category}
  data-testid={`category-option-${category.toLowerCase()}`}
  aria-label={`Category ${category}`}
>
  {category}
</SelectItem>

  ))}
</SelectContent>

          </Select>
        </div>

        {/* Customizable Toggle */}
        {customizableToggle && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowCustomizableOnly((prev) => !prev)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors
              ${showCustomizableOnly
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Customize
            </button>
          </div>
        )}
      </div>

      {/* Product List */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Products...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <ProductList products={filteredProducts} />
          
          
          {/* Pagination */}
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
    {/* First Page */}
    <Button
      onClick={() => setPage(1)}
      disabled={page === 1}
      variant="outline"
      size="icon"
      aria-label="First page"
    >
      «
    </Button>

    {/* Previous */}
    <Button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
      variant="outline"
      size="icon"
      aria-label="Previous page"
    >
      ‹
    </Button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) =>
        // Always show first, last, current ±1
        p === 1 || p === totalPages || Math.abs(p - page) <= 1
      )
      .reduce((acc, curr, i, arr) => {
        if (i > 0 && curr - (arr[i - 1] as number) > 1) acc.push('...');
        acc.push(curr);
        return acc;
      }, [] as (number | string)[])
      .map((p, idx) =>
        typeof p === 'string' ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-muted-foreground font-medium"
          >
            …
          </span>
        ) : (
          <Button
            key={`page-${p}`}
            onClick={() => setPage(p)}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            className={`w-9 h-9 rounded-full ${
              p === page ? 'bg-primary text-white' : ''
            }`}
            aria-label={`Page ${p}`}
          >
            {p}
          </Button>
        )
      )}

    {/* Next */}
    <Button
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      variant="outline"
      size="icon"
      aria-label="Next page"
    >
      ›
    </Button>

    {/* Last Page */}
    <Button
      onClick={() => setPage(totalPages)}
      disabled={page === totalPages}
      variant="outline"
      size="icon"
      aria-label="Last page"
    >
      »
    </Button>
  </div>
)}


        </>
      ) : (
        <p className="text-center text-muted-foreground mt-12">
          No products found matching your criteria.
        </p>
      )}
    </div>
  );
}
