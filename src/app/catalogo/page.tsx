import CatalogBrowser from '@/components/CatalogBrowser';
import { FadeIn } from '@/components/animations/FadeIn';
import { getCatalogProducts } from '@/lib/catalog';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explora el catálogo de electrodomésticos, colchones y equipos de Mosqueta.',
  alternates: { canonical: '/catalogo' },
  openGraph: {
    type: 'website',
    url: '/catalogo',
    title: 'Catálogo de productos Mosqueta',
    description: 'Electrodomésticos, colchones y equipamiento para hogares y empresas en México.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo de productos Mosqueta',
    description: 'Electrodomésticos, colchones y equipamiento para hogares y empresas en México.',
  },
};

export default async function CatalogoPage() {
  const catalogProducts = await getCatalogProducts();
  const catalogCategories = [...new Set(catalogProducts.map((product) => product.category))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  const catalogBrands = [...new Set(catalogProducts.map((product) => product.brand))]
    .sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gray-900 text-white py-16">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-300">Catálogo inicial</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight">
            Productos Mosqueta
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 font-inter">
            Consulta los modelos disponibles para hogar y negocio. Estamos incorporando precios, existencias e imágenes finales.
          </p>
        </FadeIn>
      </div>

      {catalogProducts.length > 0 ? (
        <CatalogBrowser products={catalogProducts} categories={catalogCategories} brands={catalogBrands} />
      ) : (
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-montserrat text-2xl font-extrabold text-gray-900">Catálogo temporalmente no disponible</h2>
          <p className="mt-3 text-gray-600">
            Estamos actualizando la información de productos. Intenta nuevamente en unos minutos o contáctanos para recibir atención.
          </p>
        </section>
      )}
    </div>
  );
}
