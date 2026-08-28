import Link from 'next/link';
import { ArrowRight, ShoppingCart } from 'lucide-react';

export const metadata = {
  title: 'Carrito de compras | Mosqueta',
  description: 'Revisa los productos seleccionados para tu compra.',
};

export default function CarritoPage() {
  return (
    <main className="bg-gray-50 min-h-[70vh] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-mosqueta-primary">
            <ShoppingCart className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900 font-montserrat">Tu carrito está vacío</h1>
          <p className="mt-3 text-gray-600">
            El catálogo ya contiene los productos reales. Activaremos la compra cuando estén capturados precios, existencias y reglas de entrega.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-mosqueta-primary px-6 py-3 font-bold text-white hover:bg-[#b0164e] transition-colors"
          >
            Explorar catálogo <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
