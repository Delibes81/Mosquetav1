import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CatalogProduct } from '@/data/products';
import { formatProductPrice } from '@/data/products';
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/lib/catalog-image';
import { StaggerItem } from './animations/Stagger';

export default function ProductCard({ product, eager = false }: { product: CatalogProduct; eager?: boolean }) {
  const formattedPrice = formatProductPrice(product.price);

  return (
    <StaggerItem className="h-full">
      <article className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <Link href={`/producto/${product.slug}`} className="block">
          <div className="aspect-[4/3] w-full overflow-hidden bg-[#e9ecf2] relative">
            {product.imageStatus === 'referencia' && (
              <span className="absolute top-2 left-2 z-10 bg-white/90 text-gray-700 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                Imagen de referencia
              </span>
            )}
            <span className="absolute top-2 right-2 z-10 bg-gray-900/75 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide max-w-[48%] truncate text-center">
              {product.category}
            </span>
            <Image
              src={product.image}
              alt={`${product.name} ${product.brand}`}
              fill
              className="object-contain object-center p-2 group-hover:scale-[1.02] transition-transform duration-300 sm:p-3"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              placeholder="blur"
              blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
            />
          </div>
        </Link>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-mosqueta-secondary mb-1">
            {product.brand} · {product.model}
          </p>
          <Link href={`/producto/${product.slug}`} className="block flex-grow">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 font-montserrat leading-tight mb-2 group-hover:text-mosqueta-primary transition-colors line-clamp-3">
              {product.name}
            </h2>
          </Link>
          <p className={`text-sm sm:text-xl font-bold font-inter ${formattedPrice ? 'text-gray-900' : 'text-mosqueta-primary'}`}>
            {formattedPrice ?? 'Precio por confirmar'}
          </p>
          <Link
            href={`/producto/${product.slug}`}
            className="mt-3 sm:mt-4 w-full bg-mosqueta-primary text-white font-semibold py-2 px-2 sm:py-3 sm:px-4 rounded flex items-center justify-center gap-2 hover:bg-[#b0164e] transition-colors active:scale-[0.98] text-xs sm:text-base"
          >
            Ver detalles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </StaggerItem>
  );
}
