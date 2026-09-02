"use client";

import { usePathname } from 'next/navigation';
import TopBanner from '@/components/TopBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/features/cart/CartProvider';

export default function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <main className="min-h-screen bg-slate-100">{children}</main>;
  }

  return (
    <CartProvider>
      <TopBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
