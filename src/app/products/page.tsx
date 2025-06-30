'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductList } from '@/components/products/product-list';
import { getAllProducts, getCategories, type Product } from '@/lib/products';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showCustomizableOnly, setShowCustomizableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getAllProducts(),
          getCategories()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load products or categories:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load store data." });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesCustomizable = !showCustomizableOnly || Boolean(product.customizable);
      return matchesSearch && matchesCategory && matchesCustomizable;
    });
  }, [products, searchTerm, selectedCategory, showCustomizableOnly]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const toggleShowCustomizable = () => {
    setShowCustomizableOnly(prev => !prev);
  };

  return (
    <div>
      <div className="w-full mb-10">
        {/* Search bar grande, centrada */}
        <div className="flex justify-center w-full mb-8">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search for a product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-border bg-background shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-lg placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Filtros y botón Customize */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left text-primary">
            All Products
          </h1>

          {/* Botón Customize centrado */}
          <button
            type="button"
            onClick={toggleShowCustomizable}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors
              ${showCustomizableOnly ? 'bg-primary text-white hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Customize
          </button>

          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full pl-12 py-3 rounded-full border border-border bg-background shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-base transition-all">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-lg border border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.length === 0 && !isLoading && (
                  <SelectItem value="no-categories" disabled>
                    No categories found
                  </SelectItem>
                )}
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Products...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <ProductList products={filteredProducts} />
      ) : (
        <p className="text-center text-muted-foreground mt-12">No products found matching your criteria.</p>
      )}
    </div>
  );
}
