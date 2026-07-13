import ProductCard, { Product } from '@/components/ProductCard';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer } from '@/components/animations/Stagger';
const catalogProducts: Product[] = [
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
  {
    id: '5',
    slug: 'sala-modular-confort',
    name: 'Sala Modular Confort Plus',
    price: 24999.00,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hogar',
    msi: true,
  },
  {
    id: '6',
    slug: 'archivero-metalico-4-gavetas',
    name: 'Archivero Metálico 4 Gavetas',
    price: 3200.00,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Corporativo',
    msi: false,
  },
  {
    id: '7',
    slug: 'lavadora-carga-frontal',
    name: 'Lavadora Carga Frontal 22kg',
    price: 15999.00,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hogar',
    msi: true,
  },
  {
    id: '8',
    slug: 'mesa-juntas-cristal',
    name: 'Mesa de Juntas de Cristal Templado',
    price: 12500.00,
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Corporativo',
    msi: true,
  },
];

export const metadata = {
  title: 'Catálogo | Mosqueta',
  description: 'Explora nuestro catálogo completo de productos para el hogar y la oficina.',
};

export default function CatalogoPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white py-16">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight">
            Catálogo Completo
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 font-inter">
            Descubre nuestra amplia selección de electrodomésticos, muebles y equipos. Calidad y diseño para cada espacio de tu vida.
          </p>
        </FadeIn>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Filters (Mockup) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <FadeIn delay={0.1} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 font-montserrat mb-4">Filtros</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Categoría</h3>
              <ul className="space-y-2">
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" defaultChecked />
                    Todos
                  </label>
                </li>
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" />
                    Hogar
                  </label>
                </li>
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" />
                    Corporativo
                  </label>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Precio</h3>
              <ul className="space-y-2">
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="radio" name="price" className="border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" defaultChecked />
                    Cualquier precio
                  </label>
                </li>
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="radio" name="price" className="border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" />
                    Menos de $5,000
                  </label>
                </li>
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="radio" name="price" className="border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" />
                    $5,000 - $15,000
                  </label>
                </li>
                <li>
                  <label className="flex items-center text-gray-600 hover:text-mosqueta-primary cursor-pointer">
                    <input type="radio" name="price" className="border-gray-300 text-mosqueta-primary focus:ring-mosqueta-primary mr-2" />
                    Más de $15,000
                  </label>
                </li>
              </ul>
            </div>
            
          </FadeIn>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 font-inter">Mostrando <span className="font-semibold text-gray-900">{catalogProducts.length}</span> productos</p>
            <select className="border-gray-300 rounded-md text-gray-700 py-2 pl-3 pr-10 focus:ring-mosqueta-primary focus:border-mosqueta-primary">
              <option>Recomendados</option>
              <option>Precio: de menor a mayor</option>
              <option>Precio: de mayor a menor</option>
              <option>Nuevos</option>
            </select>
          </div>
          
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerContainer>
          
          {/* Pagination Mockup */}
          <div className="mt-12 flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Anterior
              </a>
              <a href="#" aria-current="page" className="z-10 bg-mosqueta-primary border-mosqueta-primary text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                1
              </a>
              <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                2
              </a>
              <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                3
              </a>
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Siguiente
              </a>
            </nav>
          </div>
        </div>
        
      </div>
    </div>
  );
}
