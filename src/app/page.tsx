'use client'; // Still need client component for state and interactivity

import { useState, useEffect, useMemo } from 'react'; // Added useEffect
import { ProductList } from '@/components/products/product-list';
// Import seedDatabase as well
import { getAllProducts, getCategories, type Product, seedDatabase } from '@/lib/products'; // Import Prisma functions
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedSeed, setHasAttemptedSeed] = useState(false); // Prevent multiple seed attempts
  const { toast } = useToast();

  // Fetch products and categories on component mount
  useEffect(() => {
    async function loadData(attemptSeed = false) {
      setIsLoading(true);
      try {
        let fetchedProducts = await getAllProducts();

        // If no products and seeding hasn't been attempted, try seeding
        if (fetchedProducts.length === 0 && !hasAttemptedSeed && attemptSeed) {
          console.log("No products found, attempting to seed database...");
          setHasAttemptedSeed(true); // Mark that seeding has been attempted
          await seedDatabase(); // Call the seed function
          // Re-fetch products after seeding
          fetchedProducts = await getAllProducts();
          if (fetchedProducts.length > 0) {
             toast({ title: "Database Seeded", description: "Sample products loaded." });
          } else {
             console.warn("Seeding completed, but still no products found.");
             // Might indicate a deeper issue
          }
        }

        const fetchedCategories = await getCategories();

        setProducts(fetchedProducts);
        setCategories(fetchedCategories);

      } catch (error) {
        console.error("Failed to load store data:", error);
        // Display the specific error message from the catch block
        const errorMessage = (error instanceof Error) ? error.message : "Could not load store data.";
        toast({ variant: "destructive", title: "Error Loading Data", description: errorMessage });
        // If the error is specifically "Could not fetch products", we might try seeding ONCE
        if (errorMessage === "Could not fetch products." && !hasAttemptedSeed && attemptSeed) {
          console.log("Error fetching products, attempting to seed database...");
          setHasAttemptedSeed(true);
          try {
             await seedDatabase();
             // Try fetching again after seeding
             const refetchedProducts = await getAllProducts();
             const refetchedCategories = await getCategories();
             setProducts(refetchedProducts);
             setCategories(refetchedCategories);
             if (refetchedProducts.length > 0) {
                toast({ title: "Database Seeded", description: "Sample products loaded." });
             } else {
                console.warn("Seeding completed after error, but still no products found.");
             }
          } catch (seedError) {
             console.error("Failed to seed database after initial error:", seedError);
             toast({ variant: "destructive", title: "Seeding Failed", description: "Could not load sample data." });
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    // Initial load, attempt seeding if needed
    if (process.env.NODE_ENV === 'development') { // Only attempt seed in development
        loadData(true);
    } else {
        loadData(false);
    }
  }, [toast, hasAttemptedSeed]); // Add hasAttemptedSeed dependency

  // Filter products based on search term and selected category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
       const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()); // Handle null description
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]); // Depend on products state

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div>

      {/* Hero title */}
<div className="mb-12 text-center">
  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary mb-3">
    Welcome to DigitalZone JC
  </h1>
  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
    Your source for the latest in technology.
  </p>
</div>

{/* Search + Filter */}
<div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 px-4 md:px-0 max-w-4xl mx-auto mb-10">
  
  {/* Search Bar */}
  <div className="relative w-full sm:w-2/3">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
    <Input
      type="text"
      placeholder="Search for products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-background shadow-md focus:ring-2 focus:ring-primary focus:outline-none text-base"
      aria-label="Search products"
      disabled={isLoading}
    />
  </div>

  {/* Category Filter */}
  <div className="relative w-full sm:w-56">
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


       {/* Product List or Loading/Empty State */}
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
