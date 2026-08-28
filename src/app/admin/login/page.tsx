import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdminSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Acceso administrativo | Mosqueta',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin/productos');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_#fce7f3,_transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-8 shadow-2xl shadow-slate-300/40 backdrop-blur sm:p-10">
        <div className="mb-8 text-center">
          <Image
            src="/Artboard 4.png"
            alt="Mosqueta"
            width={200}
            height={60}
            priority
            className="mx-auto mb-6 h-14 w-auto object-contain"
          />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-mosqueta-primary">
            Operación interna
          </p>
          <h1 className="font-montserrat text-3xl font-extrabold text-slate-950">
            Panel administrativo
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Acceso exclusivo para el equipo autorizado de Mosqueta.
          </p>
        </div>

        <LoginForm />
      </section>
    </div>
  );
}
