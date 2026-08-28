"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAdminAction } from '@/app/admin/login/actions';
import { initialLoginState } from '@/app/admin/login/form-state';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-mosqueta-primary px-5 py-3 font-bold text-white transition hover:bg-pink-700 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'Verificando…' : 'Entrar al panel'}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState(loginAdminAction, initialLoginState);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
          Correo administrativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-mosqueta-primary focus:ring-4 focus:ring-pink-100"
        />
      </div>

      {state.message ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}

      <LoginButton />
    </form>
  );
}
