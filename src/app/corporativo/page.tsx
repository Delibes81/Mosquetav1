import Image from 'next/image';
import { Building2, Users, Truck, HeadphonesIcon, Briefcase, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/Stagger';
export const metadata = {
  title: 'Ventas Corporativas | Mosqueta',
  description: 'Soluciones integrales de equipamiento para empresas, hoteles, restaurantes y corporativos.',
};

const benefits = [
  {
    icon: <Building2 className="w-8 h-8 text-mosqueta-primary" />,
    title: 'Precios de Mayoreo',
    description: 'Descuentos exclusivos y esquemas de precios escalonados para compras por volumen.',
  },
  {
    icon: <Users className="w-8 h-8 text-mosqueta-primary" />,
    title: 'Asesoría Personalizada',
    description: 'Un ejecutivo de cuenta dedicado para ayudarte a seleccionar el equipo ideal para tu proyecto.',
  },
  {
    icon: <Truck className="w-8 h-8 text-mosqueta-primary" />,
    title: 'Logística Especializada',
    description: 'Entregas programadas y cobertura nacional para asegurar que tu equipo llegue a tiempo.',
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-mosqueta-primary" />,
    title: 'Soporte Prioritario',
    description: 'Atención técnica post-venta y garantías extendidas para clientes empresariales.',
  },
];

export default function CorporativoPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Oficina corporativa moderna"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <FadeIn delay={0.2} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight mb-6">
              Equipamos el éxito de tu empresa
            </h1>
            <p className="text-xl text-gray-300 font-inter mb-8">
              Soluciones integrales de mobiliario y equipo para oficinas, corporativos, hoteles, restaurantes e instituciones de gobierno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto-corporativo" className="bg-mosqueta-primary hover:bg-[#b0164e] text-white px-8 py-4 rounded font-semibold transition-colors text-center font-inter text-lg shadow-lg">
                Solicitar Cotización
              </a>
              <Link href="/catalogo" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded font-semibold transition-colors text-center font-inter text-lg backdrop-blur-sm">
                Ver Catálogo B2B
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 font-montserrat mb-4">¿Por qué elegir Mosqueta Empresarial?</h2>
            <p className="text-lg text-gray-600 font-inter max-w-2xl mx-auto">
              Más de 60 años de experiencia respaldan nuestra capacidad para manejar proyectos de cualquier escala con eficiencia y profesionalismo.
            </p>
          </div>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <StaggerItem key={index} className="h-full">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-montserrat mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 font-inter">{benefit.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white border-y border-gray-200">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-extrabold text-gray-900 font-montserrat mb-6">
                Sectores que atendemos
              </h2>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Briefcase className="w-6 h-6 text-mosqueta-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-gray-900 font-montserrat">Corporativos y Oficinas</h4>
                    <p className="mt-1 text-gray-600 font-inter">Escritorios, sillería ergonómica, salas de juntas y áreas de descanso.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <BadgeCheck className="w-6 h-6 text-mosqueta-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-gray-900 font-montserrat">Hotelería y Restaurantes</h4>
                    <p className="mt-1 text-gray-600 font-inter">Equipamiento de cocinas industriales, refrigeración comercial y mobiliario para huéspedes.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Building2 className="w-6 h-6 text-mosqueta-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-semibold text-gray-900 font-montserrat">Desarrollos Inmobiliarios</h4>
                    <p className="mt-1 text-gray-600 font-inter">Paquetes de electrodomésticos (línea blanca) para equipamiento de departamentos y casas.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="aspect-square relative rounded-lg overflow-hidden shadow-md">
                <Image src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Sala de juntas" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden shadow-md mt-8">
                <Image src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Cocina industrial" fill className="object-cover" />
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Contact Form Section */}
      <section id="contacto-corporativo" className="py-20 bg-gray-50">
        <FadeIn className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-mosqueta-primary px-8 py-6 text-white text-center">
              <h2 className="text-2xl font-bold font-montserrat">Inicia tu proyecto con nosotros</h2>
              <p className="mt-2 text-mosqueta-primary-100 font-inter">Déjanos tus datos y un asesor especializado te contactará en breve.</p>
            </div>
            <form className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 font-inter">Nombre completo</label>
                  <input type="text" id="nombre" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="Ej. Carlos Pérez" />
                </div>
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 font-inter">Empresa</label>
                  <input type="text" id="empresa" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="Nombre de tu organización" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-inter">Correo electrónico</label>
                  <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="carlos@empresa.com" />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 font-inter">Teléfono</label>
                  <input type="tel" id="telefono" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="10 dígitos" />
                </div>
              </div>
              
              <div>
                <label htmlFor="interes" className="block text-sm font-medium text-gray-700 font-inter">Sector de interés</label>
                <select id="interes" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border bg-white">
                  <option>Mobiliario para oficinas</option>
                  <option>Equipamiento para hoteles / restaurantes</option>
                  <option>Línea blanca para desarrollos inmobiliarios</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 font-inter">Platícanos brevemente de tu proyecto</label>
                <textarea id="mensaje" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="Ej. Necesitamos equipar 50 estaciones de trabajo..."></textarea>
              </div>
              
              <button type="button" className="w-full bg-mosqueta-primary text-white font-bold py-3 px-4 rounded hover:bg-[#b0164e] transition-colors shadow-md">
                Enviar Solicitud
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">Al enviar este formulario, aceptas nuestro Aviso de Privacidad.</p>
            </form>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
