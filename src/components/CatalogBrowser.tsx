'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { StaggerContainer } from '@/components/animations/Stagger';
import type { CatalogProduct } from '@/data/products';

const PAGE_SIZE = 18;

interface CatalogBrowserProps {
  products: CatalogProduct[];
  categories: string[];
  brands: string[];
}

export default function CatalogBrowser({ products, categories, brands }: CatalogBrowserProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [brand, setBrand] = useState('Todas');
  const [sort, setSort] = useState('catalogo');
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    const result = products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.brand, product.model, product.category]
        .some((value) => value.toLocaleLowerCase('es').includes(normalizedQuery));
      const matchesCategory = category === 'Todos' || product.category === category;
      const matchesBrand = brand === 'Todas' || product.brand === brand;
      return matchesQuery && matchesCategory && matchesBrand;
    });

    if (sort === 'nombre') return [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (sort === 'marca') return [...result].sort((a, b) => a.brand.localeCompare(b.brand, 'es'));
    return result;
  }, [brand, category, products, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_180px_190px]">
          <label className="relative block">
            <span className="sr-only">Buscar productos</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Buscar por producto, marca o modelo"
              className="w-full rounded-md border border-gray-300 py-3 pl-10 pr-4 text-gray-900 focus:border-mosqueta-primary focus:outline-none focus:ring-2 focus:ring-mosqueta-primary/20"
            />
          </label>

          <label>
            <span className="sr-only">Categoría</span>
            <select
              value={category}
              onChange={(event) => { setCategory(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 py-3 px-3 text-gray-700 focus:border-mosqueta-primary focus:outline-none"
            >
              <option>Todos</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label>
            <span className="sr-only">Marca</span>
            <select
              value={brand}
              onChange={(event) => { setBrand(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 py-3 px-3 text-gray-700 focus:border-mosqueta-primary focus:outline-none"
            >
              <option>Todas</option>
              {brands.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label>
            <span className="sr-only">Ordenar catálogo</span>
            <select
              value={sort}
              onChange={(event) => { setSort(event.target.value); setPage(1); }}
              className="w-full rounded-md border border-gray-300 py-3 px-3 text-gray-700 focus:border-mosqueta-primary focus:outline-none"
            >
              <option value="catalogo">Orden del catálogo</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="marca">Marca A-Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 font-inter">
          Mostrando <span className="font-semibold text-gray-900">{visibleProducts.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{filteredProducts.length}</span> productos
        </p>
        <p className="text-sm text-gray-500">Precios y existencias pendientes de captura</p>
      </div>

      {visibleProducts.length > 0 ? (
        <StaggerContainer
          key={`${query}-${category}-${brand}-${sort}-${currentPage}`}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index < 4} />
          ))}
        </StaggerContainer>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 px-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">No encontramos productos</h2>
          <p className="mt-2 text-gray-600">Prueba con otra marca, categoría o término de búsqueda.</p>
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginación del catálogo">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {currentPage} de {pageCount}</span>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
