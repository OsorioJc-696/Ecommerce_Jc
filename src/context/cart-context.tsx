'use client';

import type * as React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { Product } from '@/lib/products';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';

const GIFT_WRAP_COST = 10;

const generateCustomItemId = (
  productId: string | number,
  customization: any,
  giftWrap: boolean
): string => {
  const idStr = String(productId);
  const customizationString = JSON.stringify(customization || {});
  return `${idStr}-${customizationString}-${giftWrap ? 'gw' : 'no-gw'}`;
};

export interface CartItem extends Omit<Product, 'id' | 'price' | 'rating'> {
  id: string;
  price: number;
  rating?: number;
  quantity: number;
  customizationDetails?: any;
  giftWrap?: boolean;
  cartItemId: string;
  orderItems?: any[];  // o tipo específico que necesites
  reviews?: any[];    // o tipo específico que necesites
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product & {
      customizationDetails?: any;
      giftWrap?: boolean;
      category?: string;
    },
    quantity?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateGiftWrap: (cartItemId: string, giftWrap: boolean) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  giftWrapTotal: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'shoppingCart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const isGuest = !currentUser;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const loadedItems: any[] = JSON.parse(storedCart);
        const itemsWithCorrectTypes = loadedItems.map((item): CartItem => ({
          ...item,
          id: String(item.id),
          price: Number(item.price),
          rating:
            item.rating !== null && item.rating !== undefined
              ? Number(item.rating)
              : undefined,
          giftWrap: item.giftWrap || false,
          cartItemId:
            item.cartItemId ||
            generateCustomItemId(
              String(item.id),
              item.customizationDetails,
              item.giftWrap || false
            ),
          category: item.category || 'Unknown',
          image: item.image || null,
          description: item.description || null,
          stock: Number(item.stock) || 0,
          additionalImages: Array.isArray(item.additionalImages)
            ? item.additionalImages
            : [],
          baseSpecs: item.baseSpecs || null,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          orderItems: [],
          reviews: [],
        }));
        setCartItems(itemsWithCorrectTypes);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback(
    async (
      productToAdd: Product & {
        customizationDetails?: any;
        giftWrap?: boolean;
        category?: string;
      },
      quantity = 1
    ) => {
      const giftWrap = productToAdd.giftWrap || false;
      const cartItemId = generateCustomItemId(
        productToAdd.id,
        productToAdd.customizationDetails,
        giftWrap
      );
  
      if (!isGuest) {
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: productToAdd.id,
              quantity,
              giftWrap,
              customizationDetails: productToAdd.customizationDetails || {},
            }),
          });
  
          if (res.status === 403) {
            toast({
              variant: 'destructive',
              title: 'Permission Denied',
              description: 'You do not have permission to add this item.',
            });
            return;
          }
  
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Add to cart failed:', res.status, errorText);
            throw new Error('Failed to add item to cart');
          }
        } catch (error) {
          console.error('Error saving cart item to DB:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred while adding the item.',
          });
          return;
        }
      }
  
      // Local state update (sin cambios)
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.cartItemId === cartItemId
        );
        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            existingItem.stock
          );
          return prevItems.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          const initialQuantity = Math.min(quantity, productToAdd.stock);
          if (initialQuantity <= 0) return prevItems;
  
          const newItem: CartItem = {
            ...productToAdd,
            id: String(productToAdd.id),
            price: Number(productToAdd.price),
            rating:
              productToAdd.rating !== null &&
              productToAdd.rating !== undefined
                ? Number(productToAdd.rating)
                : undefined,
            quantity: initialQuantity,
            giftWrap,
            cartItemId,
            category: productToAdd.category || 'Unknown',
            image: productToAdd.image || null,
            description: productToAdd.description || null,
            stock: Number(productToAdd.stock),
            additionalImages: productToAdd.additionalImages ?? [],
            baseSpecs: productToAdd.baseSpecs as any,
            createdAt: new Date(),
            updatedAt: new Date(),
            orderItems: [],
            reviews: [],
          };
          return [...prevItems, newItem];
        }
      });
    },
    [isGuest, toast]
  );
  
  

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartItemId !== cartItemId)
    );
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );
      if (itemIndex === -1) return prevItems;
      const item = prevItems[itemIndex];
      const newQuantity = Math.max(1, Math.min(quantity, item.stock));
      if (newQuantity <= 0)
        return prevItems.filter((i) => i.cartItemId !== cartItemId);
      else
        return prevItems.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i
        );
    });
  }, []);

  const updateGiftWrap = useCallback((cartItemId: string, giftWrap: boolean) => {
    setCartItems((prevItems) => {
      const itemToUpdate = prevItems.find(
        (item) => item.cartItemId === cartItemId
      );
      if (!itemToUpdate || itemToUpdate.giftWrap === giftWrap) return prevItems;

      const remainingItems = prevItems.filter(
        (item) => item.cartItemId !== cartItemId
      );
      const newItemId = generateCustomItemId(
        itemToUpdate.id,
        itemToUpdate.customizationDetails,
        giftWrap
      );
      const existingItemWithNewId = remainingItems.find(
        (item) => item.cartItemId === newItemId
      );

      if (existingItemWithNewId) {
        const combinedQuantity = Math.min(
          existingItemWithNewId.quantity + itemToUpdate.quantity,
          itemToUpdate.stock
        );
        return remainingItems.map((item) =>
          item.cartItemId === newItemId
            ? { ...item, quantity: combinedQuantity }
            : item
        );
      } else {
        const newQuantity = Math.min(itemToUpdate.quantity, itemToUpdate.stock);
        if (newQuantity <= 0) return remainingItems;
        const updatedItem = {
          ...itemToUpdate,
          quantity: newQuantity,
          giftWrap,
          cartItemId: newItemId,
        };
        return [...remainingItems, updatedItem];
      }
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const giftWrapTotal = cartItems.reduce(
    (total, item) =>
      total + (item.giftWrap ? GIFT_WRAP_COST * item.quantity : 0),
    0
  );
  const cartTotal = subtotal + giftWrapTotal;

  if (!isLoaded) return null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateGiftWrap,
        clearCart,
        itemCount,
        subtotal,
        giftWrapTotal,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error('useCart must be used within a CartProvider');
  return context;
};
