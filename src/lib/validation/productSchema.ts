import { z } from 'zod';

export const baseSpecsSchema = z.record(z.string(), z.any()).nullable().optional();

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]),
  image: z.string().url().nullable().optional(),
  additionalImages: z.array(z.string().url()).nullable().optional(),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  customizable: z.string().nullable().optional(),
  baseSpecs: baseSpecsSchema,
});

export const productUpdateSchema = productSchema.partial().extend({
  price: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]).optional(),
  rating: z.union([z.number(), z.null()]).optional(),
});
