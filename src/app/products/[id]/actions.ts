'use server';

import { addProductReview } from '@/lib/products';
import type { Review } from '@/lib/products';

export async function addReviewAction(
  productId: number,
  author: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; message: string; review?: Review }> {
  if (rating === 0) {
    return { success: false, message: "Please select a star rating." };
  }

  if (!comment.trim()) {
    return { success: false, message: "Please enter your review comment." };
  }

  try {
    const newReview = await addProductReview(productId, {
      author, rating, comment,
      authorId: 0
    });
    return { success: true, message: "Review submitted successfully!", review: newReview };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, message: "Failed to submit review." };
  }
}
