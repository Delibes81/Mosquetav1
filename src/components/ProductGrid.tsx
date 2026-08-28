import Link from 'next/link';
import ProductCard from './ProductCard';
import { StaggerContainer } from './animations/Stagger';
import type { CatalogProduct } from '@/data/products';
import { getCatalogProducts } from '@/lib/catalog';

const featuredCategories = ['Centros de lavado', 'Colchones', 'Pantallas', 'Refrigeradores'];

export default async function ProductGrid() {
  const catalogProducts = await getCatalogProducts();
  const featuredProducts = featuredCategories
    .map((category) => catalogProducts.find((product) => product.category === category))
    .filter((product): product is CatalogProduct => Boolean(product));

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 font-montserrat">Catálogo destacado</h2>
            <p className="mt-2 text-gray-600 font-inter">Una primera selección del catálogo real de Mosqueta</p>
          </div>
          <Link href="/catalogo" className="mt-4 md:mt-0 text-mosqueta-primary font-semibold hover:underline font-inter">
            Ver los {catalogProducts.length} productos &rarr;
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} eager />
          ))}
        </StaggerContainer>

        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/catalogo" className="bg-mosqueta-primary text-white font-bold py-3 px-8 rounded hover:bg-[#b0164e] transition-colors shadow-md w-full text-center">
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
}
