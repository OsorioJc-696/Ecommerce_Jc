// lib/projectUpdateInfoSubscribe.ts
'use server'; // Mark functions for server-side execution or use in Server Actions

import { Product } from '@/generated/prisma/wasm';
import prisma from './prisma';
import type { Product as PrismaProduct, Review as PrismaReview, Review } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Import Prisma for JsonValue

// Re-exporting Prisma types or defining application-specific types
export type { PrismaProduct as Product, PrismaReview as Review };


// --- Prisma Functions ---

/**
 * Retrieves all products from the database.
 */
export interface ProductDto {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    additionalImages: string[] | null;
    category: string;
    stock: number;
    customizable: string | null;
    baseSpecs: Prisma.JsonValue | null;
    rating: number | null;
    createdAt: Date;
    updatedAt: Date;
    reviews: {
        authorId: any;
        id: number;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
        author: string | null;
        comment: string | null;
        date: Date;
        productId: number;
    }[];
}

export async function getAllProducts(): Promise<ProductDto[]> {
    try {
        const products = await prisma.product.findMany({
            include: { reviews: true }, // Include reviews if needed on listing pages
        });
        // Convert Decimal to number for client-side consistency if necessary
        return products.map(p => ({
             ...p,
             price: Number(p.price), // Convert price
             rating: p.rating !== null ? Number(p.rating) : null, // Convert rating, ensure null not undefined
             baseSpecs: p.baseSpecs as Prisma.JsonValue | null, // Keep as JsonValue or null
             additionalImages: p.additionalImages as string[] | null, // Expect string[] or null
        }));
    } catch (error) {
        console.error("Error fetching products:", error);
        // Provide a more specific error message if possible
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Example: Check for database connection errors
            if (error.code === 'P1001') {
                 throw new Error("Database connection failed. Could not fetch products.");
            }
        }
        throw new Error("Could not fetch products. Please ensure the database is running and accessible.");
    }
}

/**
 * Retrieves a single product by its ID.
 */
export async function getProductById(id: number): Promise<ProductDto | null> {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { reviews: true }, // Include related reviews
        });
        if (!product) return null;

        // Convert Decimal/Json types and ensure the returned object matches ProductDto
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            image: product.image,
            additionalImages: product.additionalImages as string[] | null,
            category: product.category,
            stock: product.stock,
            customizable: product.customizable,
            baseSpecs: product.baseSpecs as Prisma.JsonValue | null,
            rating: product.rating !== null ? Number(product.rating) : null,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            reviews: product.reviews?.map(r => ({
                authorId: (r as any).authorId ?? null,
                id: r.id,
                rating: Number(r.rating),
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                author: r.author,
                comment: r.comment,
                date: r.date,
                productId: r.productId,
            })) || [],
        };
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error("Could not fetch product.");
    }
}

/**
 * Retrieves all unique categories from the products.
 */
export async function getCategories(): Promise<string[]> {
     try {
        const categories = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        return categories.map(c => c.category).sort();
    } catch (error) {
         console.error("Error fetching categories:", error);
         throw new Error("Could not fetch categories.");
    }
}

/**
 * Adds a review to a product.
 */
export async function addProductReview(
  productId: number,
  review: Omit<Review, 'id' | 'date' | 'createdAt' | 'updatedAt' | 'productId'> & { authorId?: number } // Assuming authorId might be linked later
): Promise<Review> {
  try {
    const newReview = await prisma.review.create({
      data: {
        productId: productId,
        author: review.author, // In a real app, link to userId
        rating: review.rating,
        comment: review.comment,
        date: new Date(), // Set date explicitly
        // createdAt/updatedAt are handled automatically
      },
    });

    // Optional: Recalculate and update the product's average rating
    await updateProductRating(productId);

     return {
         ...newReview,
         rating: Number(newReview.rating) // Convert rating
     };
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw new Error("Could not add review.");
  }
}

/**
 * Updates the average rating for a product based on its reviews.
 */
async function updateProductRating(productId: number): Promise<void> {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true },
        });

        if (reviews.length === 0) {
            await prisma.product.update({
                where: { id: productId },
                data: { rating: null },
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await prisma.product.update({
            where: { id: productId },
            data: { rating: parseFloat(averageRating.toFixed(2)) }, // Store as float with precision
        });
    } catch (error) {
         console.error(`Error updating rating for product ${productId}:`, error);
         // Don't throw, as review submission might have succeeded
    }
}


/**
 * Updates product details in the database.
 * Only include fields that need updating.
 */
export async function updateProduct(
    productId: number,
    updateData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'reviews' | 'orderItems' | 'price' | 'rating'> & { price?: number | string; rating?: number | null }> // Allow number or string for price/rating input
): Promise<ProductDto> {
    try {
         // Convert price/rating back to Decimal if needed, handle JSON fields
         // Ensure null values are set as Prisma.JsonNull for JSON fields
         // Start with an empty object and add only valid fields
         const dataToUpdate: Prisma.ProductUpdateInput = {};

         if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
         if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
         if (updateData.image !== undefined) dataToUpdate.image = updateData.image;
         if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
         if (updateData.stock !== undefined) dataToUpdate.stock = updateData.stock;
         if (updateData.customizable !== undefined) dataToUpdate.customizable = updateData.customizable;

         if (updateData.price !== undefined) {
             dataToUpdate.price = parseFloat(String(updateData.price));
         }
         if (updateData.rating !== undefined) {
             dataToUpdate.rating = updateData.rating !== null ? parseFloat(String(updateData.rating)) : null;
         }
         if (updateData.baseSpecs !== undefined) {
             dataToUpdate.baseSpecs = updateData.baseSpecs === null
                 ? { set: null }
                 : { set: updateData.baseSpecs as Prisma.InputJsonValue };
         }
         if (updateData.additionalImages !== undefined) {
             dataToUpdate.additionalImages = updateData.additionalImages === null
                 ? { set: null }
                 : { set: updateData.additionalImages as Prisma.InputJsonValue };
         }


        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: dataToUpdate,
            include: { reviews: true },
        });
        // Convert Decimal/Json types for return value and match ProductDto structure
        return {
            id: updatedProduct.id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: Number(updatedProduct.price),
            image: updatedProduct.image,
            additionalImages: updatedProduct.additionalImages as string[] | null,
            category: updatedProduct.category,
            stock: updatedProduct.stock,
            customizable: updatedProduct.customizable,
            baseSpecs: updatedProduct.baseSpecs as Prisma.JsonValue | null,
            rating: updatedProduct.rating !== null ? Number(updatedProduct.rating) : null,
            createdAt: updatedProduct.createdAt,
            updatedAt: updatedProduct.updatedAt,
            reviews: updatedProduct.reviews?.map(r => ({
                authorId: (r as any).authorId ?? null,
                id: r.id,
                rating: Number(r.rating),
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                author: r.author,
                comment: r.comment,
                date: r.date,
                productId: r.productId,
            })) || [],
        };
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        throw new Error("Could not update product.");
    }
}

/**
 * Decreases the stock of a product.
 */
export async function decreaseProductStock(productId: number, quantity: number): Promise<boolean> {
    if (quantity <= 0) return false;

    try {
        const result = await prisma.product.updateMany({
            where: {
                id: productId,
                stock: { gte: quantity }, // Only update if stock is sufficient
            },
            data: {
                stock: {
                    decrement: quantity,
                },
            },
        });

        if (result.count === 0) {
             console.warn(`Stock update failed for product ${productId}: Insufficient stock or product not found.`);
             return false; // Update didn't happen (likely due to insufficient stock)
        }

        console.log(`Decreased stock for ${productId} by ${quantity}.`);
        return true; // Update successful
    } catch (error) {
        console.error(`Error decreasing stock for product ${productId}:`, error);
        throw new Error("Could not update product stock.");
    }
}


/**
 * Adds a new product to the database.
 */
export async function addProduct(
    newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'reviews' | 'orderItems' | 'rating' | 'price'> & { price: number | string } // Require price as number or string
): Promise<Product> {
    try {
        const productToCreate: Prisma.ProductCreateInput = {
             ...newProductData,
             price: parseFloat(String(newProductData.price)), // Ensure price is a number
             baseSpecs: newProductData.baseSpecs === undefined || newProductData.baseSpecs === null ? Prisma.JsonNull : newProductData.baseSpecs as Prisma.InputJsonValue, // Use Prisma.JsonNull for null
             additionalImages: newProductData.additionalImages === undefined || newProductData.additionalImages === null ? Prisma.JsonNull : newProductData.additionalImages as Prisma.InputJsonValue, // Use Prisma.JsonNull for null
             rating: null, // Initialize rating as null
             // Explicitly exclude relations if they are not meant to be created here
             // reviews: undefined,
             // orderItems: undefined,
        };

        const newProduct = await prisma.product.create({
            data: productToCreate,
        });
        // Convert Decimal for return value
        return {
            ...newProduct,
            price: new Prisma.Decimal(newProduct.price),
            rating: null, // Rating starts as null
            baseSpecs: newProduct.baseSpecs as Prisma.JsonValue | null,
            additionalImages: newProduct.additionalImages as string[] | null
        };
    } catch (error) {
        console.error("Error adding product:", error);
        throw new Error("Could not add product.");
    }
}

/**
 * Deletes a product from the database.
 * WARNING: Ensure related OrderItems, Reviews etc. are handled (e.g., cascade delete or prevent deletion if referenced).
 * Prisma schema needs onDelete rules for this.
 */
export async function deleteProduct(productId: number): Promise<boolean> {
    try {
         // Add checks here if needed (e.g., check if product is in active orders)
         // Example: const orders = await prisma.orderItem.count({ where: { productId } }); if (orders > 0) throw new Error(...)

        // First, delete related Reviews
        await prisma.review.deleteMany({
            where: { productId: productId },
        });

        // Then, optionally handle OrderItems (e.g., set productId to null if allowed, or prevent deletion)
        // For now, we assume OrderItems might prevent deletion if productId is required
        // or the schema handles it (e.g., onDelete: Restrict or Cascade)

        // Now, delete the product
        await prisma.product.delete({
            where: { id: productId },
        });
        console.log(`Deleted product ${productId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        // Check for foreign key constraint errors specifically for OrderItem if not handled by cascade
        if ((error as any)?.code === 'P2003' && (error as any)?.meta?.field_name?.includes('OrderItem_productId_fkey')) {
             throw new Error(`Cannot delete product ${productId} because it is referenced in existing orders. Consider updating orders first.`);
         } else if ((error as any)?.code === 'P2003') {
            throw new Error(`Cannot delete product ${productId} due to related data. Check dependencies.`);
         }
        throw new Error("Could not delete product.");
    }
}

/**
 * Seeds the database with sample products if it's empty.
 * Run this manually or conditionally on app startup (carefully in production).
 */
// Example sample products for seeding (customize as needed)
const sampleProducts: Array<{
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    additionalImages: string[] | null;
    category: string;
    stock: number;
    customizable: string | null;
    baseSpecs: Prisma.JsonValue | null;
    rating?: number | null;
}> = [
    {
        name: "Sample Product 1",
        description: "A sample product for seeding.",
        price: 19.99,
        image: null,
        additionalImages: null,
        category: "Sample Category",
        stock: 10,
        customizable: null,
        baseSpecs: null,
        rating: null,
    },
    {
        name: "Sample Product 2",
        description: "Another sample product.",
        price: 29.99,
        image: null,
        additionalImages: null,
        category: "Sample Category",
        stock: 5,
        customizable: null,
        baseSpecs: null,
        rating: null,
    },
];

export async function seedDatabase() {
    try {
        const productCount = await prisma.product.count();
        if (productCount === 0) {
            console.log("Database empty, seeding with sample products...");
            // Convert sample data structure for Prisma createMany
             const productsToSeed = sampleProducts.map(p => ({
                 ...p,
                 price: p.price, // Prisma expects Decimal compatible type
                 baseSpecs: p.baseSpecs === null ? Prisma.JsonNull : p.baseSpecs as Prisma.InputJsonValue, // Use Prisma.JsonNull for null
                 additionalImages: p.additionalImages === null ? Prisma.JsonNull : p.additionalImages as Prisma.InputJsonValue, // Use Prisma.JsonNull for null
                 rating: p.rating ?? null, // Use null if rating is undefined
             }));

            await prisma.product.createMany({
                data: productsToSeed,
                skipDuplicates: true, // Avoid errors if run multiple times (though count check prevents this)
            });
            console.log(`Seeded ${productsToSeed.length} products.`);
        } else {
            console.log("Database already contains products, skipping seed.");
        }
    } catch (error) {
        console.error("Error seeding database:", error);
         // Don't throw error here, seeding is optional
    }
}
