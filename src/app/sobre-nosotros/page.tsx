import Image from 'next/image';
import { History, ShieldCheck, Truck, Store, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Sobre Nosotros | Mosqueta',
  description: 'Conoce la historia de Mosqueta, una empresa 100% mexicana con más de 60 años de tradición equipando hogares y corporativos.',
};

export default function SobreNosotrosPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1542341065-288251e7a57a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Historia de Mosqueta"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-montserrat tracking-tight mb-6">
            Más de 60 años de Tradición Mexicana
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-300 font-inter leading-relaxed">
            Somos una empresa 100% familiar, con raíces profundas en la Ciudad de México y una sólida trayectoria equipando corporativos. Hoy, abrimos nuestras puertas a tu hogar.
          </p>
        </div>
      </section>

      {/* History and Origins */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mosqueta-secondary/10 text-mosqueta-secondary font-semibold text-sm mb-6 uppercase tracking-wider">
                <History className="w-4 h-4" />
                Nuestros Orígenes
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-montserrat mb-6 leading-tight">
                El corazón de la Ciudad de México nos vio nacer
              </h2>
              <p className="text-lg text-gray-600 font-inter mb-6 leading-relaxed">
                Nuestra historia formal comenzó el <strong>15 de enero de 1971</strong>, pero nuestro legado se remonta a más de seis décadas atrás. Nuestra sede histórica y origen de operaciones se encuentra en el vibrante corazón de la capital: la <strong>Calle Mosqueta, en la emblemática Colonia Guerrero</strong>.
              </p>
              <p className="text-lg text-gray-600 font-inter leading-relaxed">
                Desde entonces, el nombre Mosqueta se ha convertido en sinónimo de confiabilidad, solidez y un servicio cálido que entiende y valora al trabajador y las familias mexicanas.
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Centro Histórico CDMX" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution B2B to B2C */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mosqueta-primary/10 text-mosqueta-primary font-semibold text-sm mb-6 uppercase tracking-wider">
                <Store className="w-4 h-4" />
                La Evolución
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-montserrat mb-6 leading-tight">
                De los grandes corporativos, a tu hogar
              </h2>
              <p className="text-lg text-gray-600 font-inter mb-6 leading-relaxed">
                Durante décadas, nuestro fuerte ha sido el equipamiento por volumen. Contamos con una prestigiosa cartera de clientes que incluye a titanes de la industria como <strong>Grupo Martí, Desarrollos Residenciales ARA, Nestlé, Televisa</strong> y múltiples proyectos del sector gobierno.
              </p>
              <p className="text-lg text-gray-600 font-inter leading-relaxed">
                Hoy, Mosqueta da el salto al mundo digital creando nuestra "sucursal en línea". Nuestro objetivo es claro: llevar la misma calidad, durabilidad y seriedad corporativa que exigen las grandes empresas, directamente a los hogares de la clase media mexicana. Al eliminar intermediarios, te garantizamos un precio justo por un valor inigualable.
              </p>
            </div>
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Corporativo" fill className="object-cover" />
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                  <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Hogar Mexicano" fill className="object-cover" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                  <Image src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Electrodomésticos" fill className="object-cover" />
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <Image src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mobiliario" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Trust */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-montserrat mb-4">Pilares de Confianza</h2>
          <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">
            Nuestro servicio institucional respaldado por años de experiencia, ahora enfocado en tu satisfacción total.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-mosqueta-primary">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">Alto Valor Funcional</h3>
              <p className="text-gray-600 font-inter">
                Comercializamos productos diseñados para resistir el ritmo de vida actual, tanto en grandes oficinas como en los hogares más dinámicos.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-mosqueta-primary">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">Garantía Directa</h3>
              <p className="text-gray-600 font-inter">
                Al ser un proveedor institucional con décadas de respaldo, te ofrecemos trato directo, respuesta rápida y la seriedad que te mereces como cliente.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6 text-mosqueta-primary">
                <Truck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-montserrat mb-4">Logística Propia</h3>
              <p className="text-gray-600 font-inter">
                No dependemos de terceros. Manejamos nuestros propios envíos en la CDMX y Área Metropolitana con personal capacitado para asegurar que todo llegue impecable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="bg-mosqueta-primary py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold font-montserrat mb-6">¿Estás listo para renovar tus espacios?</h2>
          <p className="text-xl text-mosqueta-primary-100 font-inter mb-10 max-w-2xl mx-auto">
            Descubre nuestro catálogo o contáctanos para proyectos institucionales. Estamos listos para atenderte con la misma calidez de siempre.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/catalogo" className="bg-white text-mosqueta-primary hover:bg-gray-100 px-8 py-4 rounded font-bold transition-colors font-inter text-lg shadow-lg">
              Explorar Catálogo
            </Link>
            <a href="mailto:info@mosqueta.com.mx" className="bg-mosqueta-secondary hover:bg-opacity-90 text-white px-8 py-4 rounded font-bold transition-colors font-inter text-lg shadow-lg border border-transparent">
              info@mosqueta.com.mx
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
