import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import Image from 'next/image';
import { FadeIn } from '@/components/animations/FadeIn';

export const metadata = {
  title: 'Contacto | Mosqueta',
  description: 'Comunícate con Mosqueta. Estamos listos para atenderte y ayudarte a equipar tu hogar u oficina.',
};

export default function ContactoPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight mb-4">
            Estamos aquí para servirte
          </h1>
          <p className="text-xl text-gray-300 font-inter max-w-2xl mx-auto">
            Tienes dudas sobre nuestros productos o necesitas asesoría para un proyecto institucional? Contáctanos y nuestro equipo te responderá a la brevedad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Form Section */}
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full">
              <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">Envíanos un mensaje</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-inter">Nombre completo</label>
                    <input type="text" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-inter">Correo electrónico</label>
                    <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="juan@ejemplo.com" />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 font-inter">Asunto</label>
                  <select id="subject" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border bg-white">
                    <option>Duda sobre un producto del catálogo</option>
                    <option>Seguimiento de mi pedido (Hogar)</option>
                    <option>Solicitud de cotización B2B (Corporativo)</option>
                    <option>Servicio Técnico / Garantía</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-inter">Mensaje</label>
                  <textarea id="message" rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-mosqueta-primary focus:ring-mosqueta-primary py-2 px-3 border" placeholder="¿En qué te podemos ayudar?"></textarea>
                </div>

                <button type="button" className="w-full sm:w-auto bg-mosqueta-primary text-white font-bold py-3 px-8 rounded hover:bg-[#b0164e] transition-colors shadow-md">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Contact Info Section */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">Información de Contacto</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mosqueta-primary/10 text-mosqueta-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 font-montserrat">Sede Histórica</h3>
                      <p className="mt-2 text-base text-gray-600 font-inter">
                        Calle Mosqueta<br />
                        Colonia Guerrero, Cuauhtémoc<br />
                        Ciudad de México, CDMX
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mosqueta-primary/10 text-mosqueta-primary">
                        <Mail className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 font-montserrat">Correo Electrónico</h3>
                      <p className="mt-2 text-base text-gray-600 font-inter">
                        <a href="mailto:info@mosqueta.com.mx" className="hover:text-mosqueta-primary transition-colors">info@mosqueta.com.mx</a>
                      </p>
                      <p className="text-sm text-gray-500 font-inter mt-1">Soporte y Ventas Institucionales</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mosqueta-primary/10 text-mosqueta-primary">
                        <Phone className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 font-montserrat">Teléfono</h3>
                      <p className="mt-2 text-base text-gray-600 font-inter">
                        <a href="tel:5512345678" className="hover:text-mosqueta-primary transition-colors">(55) 1234 5678</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mosqueta-primary/10 text-mosqueta-primary">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 font-montserrat">Horario de Atención</h3>
                      <p className="mt-2 text-base text-gray-600 font-inter">
                        Lunes a Viernes: 9:00 AM - 6:00 PM<br />
                        Sábados: 9:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Visual */}
              <div className="mt-10 relative h-64 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=es&amp;q=Mosqueta%20132,%20Guerrero,%20Cuauht%C3%A9moc,%20Ciudad%20de%20M%C3%A9xico,%20CDMX+(Mosqueta)&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                  title="Mapa de ubicación Mosqueta 132"
                  className="absolute inset-0"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </FadeIn>
          
        </div>
      </div>
    </div>
  );
}
