import Link from 'next/link';
import { ExternalLink, LogOut, PackageSearch, ShieldCheck } from 'lucide-react';
import { logoutAdminAction } from '@/app/admin/actions';
import type { AdminSession } from '@/lib/admin/catalog-types';

export default function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 px-5 py-5 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-300">Mosqueta</p>
            <p className="mt-1 font-montserrat text-xl font-extrabold">Administración</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize">
            {session.role}
          </span>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-2">
          <Link
            href="/admin/productos"
            className="flex min-w-max items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15"
          >
            <PackageSearch size={19} />
            Productos
          </Link>
          <Link
            href="/catalogo"
            target="_blank"
            className="flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={18} />
            Ver tienda
          </Link>
        </nav>

        <div className="mt-6 border-t border-white/10 pt-5 lg:mt-auto lg:pt-6">
          <div className="mb-4 flex items-start gap-3 text-sm text-slate-300">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={18} />
            <div>
              <p className="font-semibold text-white">Sesión protegida</p>
              <p className="mt-1 text-xs">{session.displayName ?? 'Usuario autorizado'}</p>
            </div>
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
