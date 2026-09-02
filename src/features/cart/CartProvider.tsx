'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, CartProduct } from './cart-types';

const CART_STORAGE_KEY = 'mosqueta-cart-v1';
const DEFAULT_MAX_QUANTITY = 99;

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  hydrated: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CartItem>;

  return typeof item.id === 'string'
    && typeof item.slug === 'string'
    && typeof item.name === 'string'
    && typeof item.brand === 'string'
    && typeof item.model === 'string'
    && typeof item.image === 'string'
    && typeof item.price === 'number'
    && Number.isFinite(item.price)
    && typeof item.quantity === 'number'
    && Number.isInteger(item.quantity)
    && item.quantity > 0
    && (item.stock === null || (typeof item.stock === 'number' && Number.isInteger(item.stock)))
    && ['por-confirmar', 'en-stock', 'sobre-pedido', 'agotado'].includes(item.availability ?? '');
}

function maximumQuantity(item: Pick<CartProduct, 'stock'>) {
  return item.stock === null ? DEFAULT_MAX_QUANTITY : Math.max(1, item.stock);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart) as unknown;
          if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // El carrito sigue funcionando durante la sesión si el navegador bloquea el almacenamiento.
    }
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    hydrated,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem(product) {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);
        if (!existingItem) return [...currentItems, { ...product, quantity: 1 }];

        return currentItems.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, maximumQuantity(item)) }
          : item);
      });
    },
    updateQuantity(id, quantity) {
      setItems((currentItems) => currentItems.map((item) => item.id === id
        ? { ...item, quantity: Math.max(1, Math.min(quantity, maximumQuantity(item))) }
        : item));
    },
    removeItem(id) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    },
  }), [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe utilizarse dentro de CartProvider.');
  return context;
}
