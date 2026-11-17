"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "./actions";

function Err({ msg }) {
  return msg ? <small className="err">{msg}</small> : null;
}

export function LoginForm({ next, motivo }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span>E-mail</span>
        <input id="login-email" name="email" type="email" autoComplete="email" defaultValue={state?.email} required />
      </label>
      <label className="field">
        <span>Senha</span>
        <input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      <p className="muted small">Ainda não tem conta? <Link href={`/conta/cadastro?next=${encodeURIComponent(next)}${motivo ? `&motivo=${motivo}` : ""}`}>Criar conta</Link></p>
    </form>
  );
}

export function SignupForm({ next, motivo }) {
  const [state, action, pending] = useActionState(signup, null);
  const e = state?.errors ?? {};
  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span>Nome completo</span>
        <input id="signup-name" name="name" autoComplete="name" defaultValue={state?.values?.name} required />
        <Err msg={e.name} />
      </label>
      <label className="field">
        <span>E-mail</span>
        <input id="signup-email" name="email" type="email" autoComplete="email" defaultValue={state?.values?.email} required />
        <Err msg={e.email} />
      </label>
      <label className="field">
        <span>Senha (mínimo 8 caracteres)</span>
        <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <Err msg={e.password} />
      </label>
      {e.form && <p className="form-error" role="alert">{e.form}</p>}
      <button className="btn btn-primary full" disabled={pending}>{pending ? "Criando…" : "Criar conta"}</button>
      <p className="muted small">Já tem conta? <Link href={`/conta/entrar?next=${encodeURIComponent(next)}${motivo ? `&motivo=${motivo}` : ""}`}>Entrar</Link></p>
    </form>
  );
}
