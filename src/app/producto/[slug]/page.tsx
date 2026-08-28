import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, MessageCircle, Truck } from 'lucide-react';
import { catalogProducts, formatProductPrice } from '@/data/products';
import { getCatalogProductBySlug } from '@/lib/catalog';

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) return { title: 'Producto no encontrado | Mosqueta' };

  return {
    title: `${product.name} | Mosqueta`,
    description: `${product.brand} ${product.model}. ${product.specifications.slice(0, 135)}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const formattedPrice = formatProductPrice(product.price);
  const attributes = [
    { name: 'Marca', value: product.brand },
    { name: 'Modelo', value: product.model },
    product.color ? { name: 'Color', value: product.color } : null,
    product.size ? { name: 'Tamaño', value: product.size } : null,
    { name: 'Disponibilidad', value: 'Por confirmar' },
  ].filter((item): item is { name: string; value: string } => Boolean(item));

  return (
    <div className="bg-white">
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500 font-inter">
          <li><Link href="/" className="hover:text-mosqueta-primary">Inicio</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li><Link href="/catalogo" className="hover:text-mosqueta-primary">Catálogo</Link></li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="truncate text-gray-900 font-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          <div>
            <div className="relative bg-[#e9ecf2] rounded-xl overflow-hidden min-h-[440px] md:min-h-[620px] border border-gray-200">
              <Image
                src={product.image}
                alt={`${product.name} ${product.brand}`}
                fill
                className="object-contain"
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            {product.imageStatus === 'referencia' && (
              <p className="mt-3 text-xs text-gray-500 text-center">
                Imagen tomada del catálogo recibido. Se reemplazará por la fotografía final del SKU.
              </p>
            )}
          </div>

          <div className="mt-10 sm:mt-16 lg:mt-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mosqueta-secondary">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 font-montserrat">
              {product.name}
            </h1>
            <p className="mt-3 text-base font-semibold text-gray-500">{product.brand} · {product.model}</p>

            <div className="mt-6 rounded-lg border border-pink-100 bg-pink-50 p-5">
              <p className="text-sm font-semibold text-gray-600">Precio de venta</p>
              <p className="mt-1 text-3xl font-bold text-mosqueta-primary font-inter">
                {formattedPrice ?? 'Por confirmar'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Estamos incorporando precios y existencias al catálogo. Puedes solicitar disponibilidad de este modelo.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contacto"
                className="flex-1 bg-mosqueta-primary rounded-md py-3 px-6 flex items-center justify-center gap-2 text-base font-bold text-white hover:bg-[#b0164e] transition-colors shadow-sm"
              >
                <MessageCircle className="w-5 h-5" /> Consultar producto
              </Link>
              <Link
                href="/catalogo"
                className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-6 flex items-center justify-center text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Volver al catálogo
              </Link>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-bold text-gray-900 font-montserrat mb-4">Datos del producto</h2>
              <dl className="divide-y divide-gray-200 border-y border-gray-200">
                {attributes.map((attribute) => (
                  <div key={attribute.name} className="py-3 flex gap-4 justify-between">
                    <dt className="text-sm font-medium text-gray-500">{attribute.name}</dt>
                    <dd className="text-sm text-right text-gray-900 font-semibold">{attribute.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 font-montserrat">
                <FileText className="w-5 h-5 text-mosqueta-secondary" /> Especificaciones
              </h2>
              <p className="mt-3 text-base text-gray-700 leading-relaxed">{product.specifications}</p>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-mosqueta-secondary flex-shrink-0 mt-0.5" />
              La cobertura, el costo y el tiempo de entrega se confirmarán según el producto y código postal.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
