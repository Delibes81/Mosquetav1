'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/features/cart/CartProvider';

export default function ClearPaidCart() {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}
