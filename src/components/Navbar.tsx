"use client";

import Link from 'next/link';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-mosqueta-primary text-white px-3 py-1 rounded text-3xl font-bold leading-none font-montserrat tracking-tighter">M</div>
              <div className="flex flex-col justify-center">
                <span className="text-mosqueta-primary font-montserrat font-bold text-2xl tracking-tight leading-none mb-1">MOSQUETA</span>
                <span className="text-mosqueta-secondary text-[11px] font-semibold tracking-widest leading-none">HOGAR Y OFICINA</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center flex-1 justify-center">
            <Link href="/" className="text-gray-700 hover:text-mosqueta-primary font-semibold text-sm transition-colors font-montserrat">Inicio</Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-mosqueta-primary font-semibold text-sm transition-colors font-montserrat">Catálogo</Link>
            <Link href="/corporativo" className="text-gray-700 hover:text-mosqueta-primary font-semibold text-sm transition-colors font-montserrat">Ventas Corporativas</Link>
            <Link href="/sobre-nosotros" className="text-gray-700 hover:text-mosqueta-primary font-semibold text-sm transition-colors font-montserrat">Sobre Nosotros</Link>
            <Link href="/contacto" className="text-gray-700 hover:text-mosqueta-primary font-semibold text-sm transition-colors font-montserrat">Contacto</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-gray-600 hover:text-mosqueta-primary transition-colors hidden sm:block" aria-label="Buscar">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/carrito" className="text-gray-600 hover:text-mosqueta-primary transition-colors relative" aria-label="Carrito" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-2 bg-mosqueta-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </Link>
            <button 
              className="text-gray-600 hover:text-mosqueta-primary md:hidden" 
              aria-label="Menú"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
            <Link href="/" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-mosqueta-primary hover:bg-gray-50 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
            <Link href="/catalogo" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-mosqueta-primary hover:bg-gray-50 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Catálogo</Link>
            <Link href="/corporativo" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-mosqueta-primary hover:bg-gray-50 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Ventas Corporativas</Link>
            <Link href="/sobre-nosotros" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-mosqueta-primary hover:bg-gray-50 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Sobre Nosotros</Link>
            <Link href="/contacto" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-mosqueta-primary hover:bg-gray-50 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Contacto</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
