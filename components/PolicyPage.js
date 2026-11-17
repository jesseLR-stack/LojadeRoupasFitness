import Link from "next/link";
import { POLICY_UPDATED, STORE, formatWhatsapp, whatsappLink } from "@/lib/store";

export const POLICY_LINKS = [
  { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
  { href: "/entrega", label: "Entrega e frete" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/contato", label: "Fale conosco" },
];

// Bloco com os canais de atendimento configurados.
export function ContactLines() {
  if (!STORE.email && !STORE.whatsapp) {
    return <p>Use o formulário de contato da loja ou responda ao e-mail de confirmação do seu pedido.</p>;
  }
  return (
    <ul>
      {STORE.email && <li>E-mail: <a href={`mailto:${STORE.email}`}>{STORE.email}</a></li>}
      {STORE.whatsapp && (
        <li>WhatsApp: <a href={whatsappLink(STORE.whatsapp)} target="_blank" rel="noopener noreferrer">{formatWhatsapp(STORE.whatsapp)}</a></li>
      )}
      <li>Horário de atendimento: {STORE.hours}</li>
    </ul>
  );
}

export default function PolicyPage({ title, intro, current, children }) {
  return (
    <div className="policy">
      <nav className="policy-nav" aria-label="Informações da loja">
        {POLICY_LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={l.href === current ? "page" : undefined}>{l.label}</Link>
        ))}
      </nav>
      <article className="policy-body">
        <p className="eyebrow">Atualizado em {POLICY_UPDATED}</p>
        <h1>{title}</h1>
        {intro && <p className="policy-intro">{intro}</p>}
        {children}
      </article>
    </div>
  );
}
