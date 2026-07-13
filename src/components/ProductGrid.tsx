import ProductCard, { Product } from './ProductCard';

const featuredProducts: Product[] = [
  {
    id: '1',
    slug: 'refrigerador-inverter-family',
    name: 'Refrigerador Inverter Family Size 22p3',
    price: 18499.00,
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hogar',
    msi: true,
  },
  {
    id: '2',
    slug: 'estufa-gas-profesional',
    name: 'Estufa a Gas Profesional 6 Quemadores',
    price: 14500.00,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hogar',
    msi: true,
  },
  {
    id: '3',
    slug: 'silla-ergonomica-executive',
    name: 'Silla Ergonómica Executive Mesh',
    price: 4599.00,
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Corporativo',
    msi: true,
  },
  {
    id: '4',
    slug: 'escritorio-directivo-l',
    name: 'Escritorio Directivo en L Minimal',
    price: 8250.00,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Corporativo',
    msi: false,
  },
];

export default function ProductGrid() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 font-montserrat">Catálogo Destacado</h2>
            <p className="mt-2 text-gray-600 font-inter">Selección premium para tu hogar u oficina</p>
          </div>
          <a href="/catalogo" className="mt-4 md:mt-0 text-mosqueta-primary font-semibold hover:underline font-inter">
            Ver todo el catálogo &rarr;
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
