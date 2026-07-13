import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-mosqueta-primary text-white px-2 py-0.5 rounded text-xl font-bold leading-none font-montserrat tracking-tighter">M</div>
              <div className="flex flex-col justify-center">
                <span className="text-mosqueta-primary font-montserrat font-bold text-lg tracking-tight leading-none mb-0.5">MOSQUETA</span>
                <span className="text-mosqueta-secondary text-[8px] font-semibold tracking-widest leading-none">HOGAR Y OFICINA</span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-4 font-inter leading-relaxed">
              Más de 60 años de tradición equipando los hogares y corporativos de México con calidad, durabilidad y confianza.
            </p>
          </div>

          {/* Links B2C */}
          <div>
            <h3 className="font-montserrat font-bold text-gray-900 mb-4">Atención al Cliente</h3>
            <ul className="space-y-2 text-sm text-gray-600 font-inter">
              <li><Link href="/soporte" className="hover:text-mosqueta-primary">Soporte y Garantías</Link></li>
              <li><Link href="/envios" className="hover:text-mosqueta-primary">Políticas de Envío</Link></li>
              <li><Link href="/devoluciones" className="hover:text-mosqueta-primary">Cambios y Devoluciones</Link></li>
              <li><Link href="/contacto" className="hover:text-mosqueta-primary">Contacto Directo</Link></li>
            </ul>
          </div>

          {/* Links B2B */}
          <div>
            <h3 className="font-montserrat font-bold text-gray-900 mb-4">Servicios Corporativos</h3>
            <ul className="space-y-2 text-sm text-gray-600 font-inter">
              <li><Link href="/facturacion" className="hover:text-mosqueta-primary">Facturación Electrónica</Link></li>
              <li><Link href="/cotizaciones" className="hover:text-mosqueta-primary">Solicitar Cotización</Link></li>
              <li><Link href="/proyectos" className="hover:text-mosqueta-primary">Proyectos a Medida</Link></li>
              <li><Link href="/b2b" className="hover:text-mosqueta-primary">Portal B2B</Link></li>
            </ul>
          </div>

          {/* Pagos */}
          <div>
            <h3 className="font-montserrat font-bold text-gray-900 mb-4">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700">Tarjetas</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700">Transferencia SPEI</span>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700">OXXO</span>
            </div>
            <p className="text-xs text-gray-500 font-inter">Pagos 100% Seguros a través de Stripe</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-inter">
          <p>&copy; {new Date().getFullYear()} Muebles Mosqueta S.A. de C.V. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacidad" className="hover:text-mosqueta-primary">Aviso de Privacidad</Link>
            <Link href="/terminos" className="hover:text-mosqueta-primary">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
