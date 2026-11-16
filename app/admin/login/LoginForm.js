"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm({ voltar }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="admin-form narrow">
      <input type="hidden" name="voltar" value={voltar} />
      <label className="field">
        <span>Senha</span>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary full" type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
