import CatalogBrowser from '@/components/CatalogBrowser';
import { FadeIn } from '@/components/animations/FadeIn';
import { getCatalogProducts } from '@/lib/catalog';

export const revalidate = 300;

export const metadata = {
  title: 'Catálogo | Mosqueta',
  description: 'Explora el catálogo de electrodomésticos, colchones y equipos de Mosqueta.',
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

      <CatalogBrowser products={catalogProducts} categories={catalogCategories} brands={catalogBrands} />
    </div>
  );
}
