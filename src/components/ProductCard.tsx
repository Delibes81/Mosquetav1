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
            <div className="absolute top-2 left-2 z-10 bg-mosqueta-secondary text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded uppercase tracking-wide">
              Opción a MSI
            </div>
          )}
          <div className="absolute top-2 right-2 z-10 bg-gray-900/70 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded uppercase tracking-wide max-w-[50%] truncate text-center">
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
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <Link href={`/producto/${product.slug}`} className="block flex-grow">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 font-montserrat leading-tight mb-1 sm:mb-2 group-hover:text-mosqueta-primary transition-colors line-clamp-3">
              {product.name}
            </h3>
            <p className="text-base sm:text-xl font-bold text-gray-900 font-inter">{formattedPrice}</p>
          </Link>
          <button className="mt-3 sm:mt-4 w-full bg-mosqueta-primary text-white font-semibold py-2 px-2 sm:py-3 sm:px-4 rounded flex items-center justify-center gap-1 sm:gap-2 hover:bg-[#b0164e] transition-colors active:scale-[0.98] text-xs sm:text-base">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">Agregar</span>
          </button>
        </div>
      </div>
    </StaggerItem>
  );
}
