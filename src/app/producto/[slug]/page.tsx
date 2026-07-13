import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Placeholder data based on slug
  const product = {
    id: '1',
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    price: 18499.00,
    images: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    msi: true,
    description: 'Equipa tu espacio con la mejor tecnología y diseño. Este producto cuenta con materiales de alta durabilidad y eficiencia energética, ideal para el uso diario en hogares y corporativos.',
    specs: [
      { name: 'Dimensiones', value: '180cm x 90cm x 85cm' },
      { name: 'Peso', value: '95 kg' },
      { name: 'Material', value: 'Acero inoxidable y cristal templado' },
      { name: 'Garantía', value: '5 años directo con Mosqueta' }
    ]
  };

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price);
  
  const msiPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(product.price / 12);

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500 font-inter">
          <li>
            <Link href="/" className="hover:text-mosqueta-primary">Inicio</Link>
          </li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li>
            <Link href="/catalogo" className="hover:text-mosqueta-primary">Catálogo</Link>
          </li>
          <li><ChevronRight className="w-4 h-4" /></li>
          <li className="text-gray-900 font-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
                {product.images.map((img, i) => (
                  <button key={i} className="relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 overflow-hidden">
                    <span className="sr-only">Imagen {i + 1}</span>
                    <Image src={img} alt="" fill className="object-cover object-center" />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full aspect-w-1 aspect-h-1 relative bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[500px]">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-montserrat">{product.name}</h1>
            
            <div className="mt-3">
              <h2 className="sr-only">Información del producto</h2>
              <p className="text-3xl font-bold text-gray-900 font-inter">{formattedPrice}</p>
              {product.msi && (
                <div className="mt-2 flex items-center text-sm text-gray-600 bg-gray-50 inline-block px-3 py-1.5 rounded-md border border-gray-200">
                  <CreditCardIcon className="w-5 h-5 text-mosqueta-secondary mr-2" />
                  Hasta 12 meses sin intereses de <span className="font-bold ml-1">{msiPrice}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Descripción</h3>
              <p className="text-base text-gray-700 font-inter leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 font-montserrat">Cantidad</h3>
                <span className="text-xs text-gray-500 font-inter">Ideal para pedidos corporativos</span>
              </div>
              <div className="mt-2 flex">
                <select className="max-w-[120px] block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-mosqueta-primary focus:border-mosqueta-primary sm:text-sm rounded-md font-inter border">
                  {[1, 2, 3, 4, 5, 10, 20, 50].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'unidad' : 'unidades'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-mosqueta-primary border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-[#b0164e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosqueta-primary transition-colors shadow-sm font-inter">
                Comprar Ahora
              </button>
              <button className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosqueta-primary transition-colors shadow-sm font-inter gap-2">
                <ShoppingCart className="w-5 h-5" />
                Agregar
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-10 border-t border-gray-200 pt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-500 font-inter">
                <ShieldCheck className="flex-shrink-0 mr-2 h-5 w-5 text-green-500" />
                Garantía directa de 5 años
              </div>
              <div className="flex items-center text-sm text-gray-500 font-inter">
                <Truck className="flex-shrink-0 mr-2 h-5 w-5 text-mosqueta-secondary" />
                Envío seguro a CDMX y Área Met.
              </div>
            </div>

            {/* Specs */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-bold text-gray-900 font-montserrat mb-4">Especificaciones Técnicas</h3>
              <div className="mt-4 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  {product.specs.map((spec) => (
                    <div key={spec.name} className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 font-inter">{spec.name}</dt>
                      <dd className="text-sm text-gray-900 font-inter font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
