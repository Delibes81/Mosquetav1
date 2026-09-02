'use client';

import Link from 'next/link';
import { ExternalLink, PackageSearch, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/productos', label: 'Productos', icon: PackageSearch },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
              active ? 'bg-white/10 font-bold text-white' : 'font-semibold text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={19} />
            {link.label}
          </Link>
        );
      })}

      <Link
        href="/catalogo"
        target="_blank"
        className="flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <ExternalLink size={18} />
        Ver tienda
      </Link>
    </nav>
  );
}
