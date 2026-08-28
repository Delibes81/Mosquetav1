"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-mosqueta-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <Image 
                src="/Artboard 4 copy.png" 
                alt="Mosqueta Logo Blanco" 
                width={200} 
                height={60} 
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center flex-1 justify-center">
            <Link href="/" className="text-white/90 hover:text-white font-semibold text-sm transition-colors font-montserrat">Inicio</Link>
            <Link href="/catalogo" className="text-white/90 hover:text-white font-semibold text-sm transition-colors font-montserrat">Catálogo</Link>
            <Link href="/corporativo" className="text-white/90 hover:text-white font-semibold text-sm transition-colors font-montserrat">Ventas Corporativas</Link>
            <Link href="/sobre-nosotros" className="text-white/90 hover:text-white font-semibold text-sm transition-colors font-montserrat">Sobre Nosotros</Link>
            <Link href="/contacto" className="text-white/90 hover:text-white font-semibold text-sm transition-colors font-montserrat">Contacto</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-white/90 hover:text-white transition-colors hidden sm:block" aria-label="Buscar">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/carrito" className="text-white/90 hover:text-white transition-colors relative" aria-label="Carrito" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <button 
              className="text-white/90 hover:text-white md:hidden" 
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
        <div className="md:hidden bg-mosqueta-primary border-t border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
            <Link href="/" className="block px-3 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
            <Link href="/catalogo" className="block px-3 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Catálogo</Link>
            <Link href="/corporativo" className="block px-3 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Ventas Corporativas</Link>
            <Link href="/sobre-nosotros" className="block px-3 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Sobre Nosotros</Link>
            <Link href="/contacto" className="block px-3 py-3 text-base font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-md font-montserrat" onClick={() => setIsMobileMenuOpen(false)}>Contacto</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
