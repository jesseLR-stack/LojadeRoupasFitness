"use client";

import { useStore } from "./StoreProvider";

export default function Newsletter() {
  const { toast } = useStore();
  return (
    <section className="newsletter">
      <h2>Entre pro <span className="accent">time</span></h2>
      <p>Receba lançamentos, cupons exclusivos e dicas de treino.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.target.reset();
          toast("Bem-vindo(a) ao time! Use o cupom NEW10 🎁");
        }}
      >
        <input id="newsletterEmail" type="email" required placeholder="Seu melhor e-mail" aria-label="E-mail" />
        <button className="btn btn-primary" type="submit">Quero 10% OFF</button>
      </form>
    </section>
  );
}
