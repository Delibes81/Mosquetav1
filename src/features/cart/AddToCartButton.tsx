'use client';

import { useEffect, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';
import type { CartProduct } from './cart-types';

interface AddToCartButtonProps {
  product: CartProduct;
  compact?: boolean;
  className?: string;
}

export default function AddToCartButton({ product, compact = false, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return undefined;
    const timeout = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        setAdded(true);
      }}
      className={`${compact ? 'py-2 px-2 text-xs sm:py-3 sm:px-4 sm:text-base' : 'py-3 px-6 text-base'} inline-flex items-center justify-center gap-2 rounded-md bg-mosqueta-primary font-bold text-white shadow-sm transition hover:bg-[#b0164e] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-pink-200 ${className}`}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
      {added ? 'Agregado' : 'Agregar al carrito'}
    </button>
  );
}
