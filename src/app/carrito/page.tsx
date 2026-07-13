import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const metadata = {
  title: 'Carrito de Compras | Mosqueta',
  description: 'Revisa los productos en tu carrito y procede al pago seguro.',
};

// Mock data para el carrito
const cartItems = [
  {
    id: '1',
    name: 'Refrigerador Inverter Family Size 22p3',
    price: 18499.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'Hogar',
  },
  {
    id: '3',
    name: 'Silla Ergonómica Executive Mesh',
    price: 4599.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    category: 'Corporativo',
  }
];

export default function CarritoPage() {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const envio = 0; // Envío gratis CDMX
  const total = subtotal + envio;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 font-montserrat mb-8">
          Tu Carrito de Compras
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-6 bg-gray-50 p-4 border-b border-gray-200 text-sm font-semibold text-gray-600 font-inter">
                <div className="col-span-3">Producto</div>
                <div className="col-span-1 text-center">Precio</div>
                <div className="col-span-1 text-center">Cantidad</div>
                <div className="col-span-1 text-right">Subtotal</div>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-6 sm:items-center gap-4">
                    {/* Producto Info */}
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-100">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{item.category}</span>
                        <Link href={`/producto/${item.id}`} className="text-base font-semibold text-gray-900 font-montserrat hover:text-mosqueta-primary transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <button className="text-sm text-red-500 font-inter mt-2 flex items-center gap-1 hover:text-red-700 w-fit">
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </div>
                    
                    {/* Precio (Desktop) */}
                    <div className="hidden sm:block col-span-1 text-center font-inter text-gray-900">
                      {formatPrice(item.price)}
                    </div>
                    
                    {/* Cantidad */}
                    <div className="col-span-1 flex justify-between sm:justify-center items-center">
                      <span className="sm:hidden font-inter text-gray-600 text-sm">Cantidad:</span>
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">-</button>
                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-300">{item.quantity}</span>
                        <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-1 flex justify-between sm:block text-right font-inter font-bold text-gray-900 text-lg">
                      <span className="sm:hidden font-inter text-gray-600 text-sm font-normal">Subtotal:</span>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <Link href="/catalogo" className="text-mosqueta-primary font-semibold hover:underline font-inter flex items-center gap-2">
                &larr; Continuar comprando
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 font-montserrat mb-6">Resumen de Compra</h2>
              
              <div className="space-y-4 font-inter text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} artículos)</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío (CDMX y Área Met.)</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 font-montserrat">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right">IVA incluido</p>
              </div>

              <button className="w-full bg-mosqueta-primary text-white font-bold py-4 px-4 rounded flex items-center justify-center gap-2 hover:bg-[#b0164e] transition-colors shadow-md text-lg active:scale-[0.98]">
                Proceder al Pago <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust Indicators */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-mosqueta-primary flex-shrink-0" />
                  <p className="text-sm text-gray-600 font-inter">Pago 100% seguro y encriptado.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-mosqueta-primary flex-shrink-0" />
                  <p className="text-sm text-gray-600 font-inter">Logística propia, entrega garantizada.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
