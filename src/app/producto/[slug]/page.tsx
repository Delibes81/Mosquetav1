import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, MessageCircle, Truck } from 'lucide-react';
import ProductImageGallery from '@/components/ProductImageGallery';
import { formatProductPrice, type ProductAvailability } from '@/data/products';
import { absoluteCatalogImage } from '@/lib/catalog-image';
import { getCatalogProductBySlug } from '@/lib/catalog';
import { absoluteUrl, siteConfig } from '@/lib/site';
import AddToCartButton from '@/features/cart/AddToCartButton';

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const availabilityLabels: Record<ProductAvailability, string> = {
  'por-confirmar': 'Por confirmar',
  'en-stock': 'En stock',
  'sobre-pedido': 'Sobre pedido',
  agotado: 'Agotado',
};

const schemaAvailability: Record<ProductAvailability, string> = {
  'por-confirmar': 'https://schema.org/OnlineOnly',
  'en-stock': 'https://schema.org/InStock',
  'sobre-pedido': 'https://schema.org/PreOrder',
  agotado: 'https://schema.org/OutOfStock',
};

function productDescription(specifications: string, brand: string, model: string) {
  const normalized = specifications.replace(/\s+/g, ' ').trim();
  return `${brand} ${model}. ${normalized}`.slice(0, 158);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado',
      robots: { index: false, follow: false },
    };
  }

  const description = productDescription(product.specifications, product.brand, product.model);
  const pathname = `/producto/${product.slug}`;
  const title = `${product.name} ${product.model}`;
  const image = absoluteCatalogImage(product.image);
  const canBeIndexed = product.dataStatus !== 'requiere-revision';

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: pathname,
      siteName: siteConfig.name,
      title: `${title} | Mosqueta`,
      description,
      images: [{ url: image, alt: `${product.name} ${product.brand} ${product.model}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mosqueta`,
      description,
      images: [image],
    },
    robots: { index: canBeIndexed, follow: canBeIndexed },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const formattedPrice = formatProductPrice(product.price);
  const productUrl = absoluteUrl(`/producto/${product.slug}`);
  const galleryImageUrls = product.gallery.map((image) => absoluteCatalogImage(image.url));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.specifications,
    image: galleryImageUrls,
    url: productUrl,
    brand: { '@type': 'Brand', name: product.brand },
    mpn: product.model,
    category: product.category,
    color: product.color ?? undefined,
    size: product.size ?? undefined,
    ...(product.price !== null
      ? {
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'MXN',
            price: product.price.toFixed(2),
            availability: schemaAvailability[product.availability],
            itemCondition: 'https://schema.org/NewCondition',
          },
        }
      : {}),
  };
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: absoluteUrl('/catalogo') },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  };
  const attributes = [
    { name: 'Marca', value: product.brand },
    { name: 'Modelo', value: product.model },
    product.color ? { name: 'Color', value: product.color } : null,
    product.size ? { name: 'Tamaño', value: product.size } : null,
    { name: 'Disponibilidad', value: availabilityLabels[product.availability] },
  ].filter((item): item is { name: string; value: string } => Boolean(item));

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData).replace(/</g, '\\u003c') }}
      />
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
            <ProductImageGallery images={product.gallery} productName={product.name} />
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
                {product.price !== null
                  ? 'Precio temporal para validar el carrito. Existencia, entrega y venta final sujetas a confirmación.'
                  : 'Estamos incorporando precios y existencias al catálogo. Puedes solicitar disponibilidad de este modelo.'}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.price !== null && product.availability !== 'agotado' && product.stock !== 0 ? (
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    model: product.model,
                    image: product.image,
                    price: product.price,
                    stock: product.stock,
                    availability: product.availability,
                  }}
                  className="w-full"
                />
              ) : null}
              <Link
                href="/contacto"
                className={`${product.price !== null ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'bg-mosqueta-primary text-white hover:bg-[#b0164e] shadow-sm'} flex rounded-md py-3 px-6 items-center justify-center gap-2 text-base font-bold transition-colors`}
              >
                <MessageCircle className="w-5 h-5" /> Consultar producto
              </Link>
              <Link
                href="/catalogo"
                className="flex rounded-md border border-gray-300 bg-white py-3 px-6 items-center justify-center text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors sm:col-span-2"
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
