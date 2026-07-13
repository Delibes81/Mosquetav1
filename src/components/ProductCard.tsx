import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { StaggerItem } from './animations/Stagger';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: 'Hogar' | 'Corporativo';
  msi: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);

  return (
    <StaggerItem className="h-full">
      <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
          {product.msi && (
            <div className="absolute top-2 left-2 z-10 bg-mosqueta-secondary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              Opción a MSI
            </div>
          )}
          <div className="absolute top-2 right-2 z-10 bg-gray-900/70 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
            {product.category}
          </div>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <Link href={`/producto/${product.slug}`} className="block flex-grow">
            <h3 className="text-lg font-semibold text-gray-900 font-montserrat leading-tight mb-2 group-hover:text-mosqueta-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xl font-bold text-gray-900 font-inter">{formattedPrice}</p>
          </Link>
          <button className="mt-4 w-full bg-mosqueta-primary text-white font-semibold py-3 px-4 rounded flex items-center justify-center gap-2 hover:bg-[#b0164e] transition-colors active:scale-[0.98]">
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </StaggerItem>
  );
}
