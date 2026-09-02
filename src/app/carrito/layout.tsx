import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrito de compras',
  description: 'Revisa los productos seleccionados para tu compra.',
  robots: { index: false, follow: false },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
