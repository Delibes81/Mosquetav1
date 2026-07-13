import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Hogar y Oficina"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-start justify-center min-h-[500px]">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-montserrat max-w-2xl leading-tight">
          60 años equipando los hogares y corporativos de México.
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-xl font-inter leading-relaxed">
          Tradición, confianza y durabilidad en cada mueble y electrodoméstico. Trato directo, envíos seguros y la garantía que tu familia y empresa merecen.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-mosqueta-primary hover:bg-[#b0164e] transition-colors shadow-lg hover:shadow-xl font-inter w-full sm:w-auto"
          >
            Ver Catálogo
          </Link>
          <Link
            href="/corporativo"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900 transition-colors shadow-lg hover:shadow-xl font-inter w-full sm:w-auto"
          >
            Cotizaciones para Empresas
          </Link>
        </div>
      </div>
    </div>
  );
}
