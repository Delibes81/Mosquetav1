import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout de invitado',
  description: 'Revisa los datos de entrega y el resumen de tu pedido Mosqueta.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
