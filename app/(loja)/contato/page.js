import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { STORE, formatWhatsapp, whatsappLink } from "@/lib/store";

export const metadata = {
  title: "Fale conosco",
  description: "Atendimento da NewFitness por e-mail e WhatsApp: dúvidas, trocas, devoluções e pedidos.",
};

export default function ContactPage() {
  const hasChannel = STORE.email || STORE.whatsapp;
  return (
    <PolicyPage current="/contato" title="Fale conosco" intro="Dúvidas sobre tamanho, pedido, troca ou entrega? Chama a gente.">
      {hasChannel ? (
        <div className="contact-cards">
          {STORE.whatsapp && (
            <a className="contact-card" href={whatsappLink(STORE.whatsapp)} target="_blank" rel="noopener noreferrer">
              <span>WhatsApp</span>
              <strong>{formatWhatsapp(STORE.whatsapp)}</strong>
              <small>Resposta mais rápida</small>
            </a>
          )}
          {STORE.email && (
            <a className="contact-card" href={`mailto:${STORE.email}`}>
              <span>E-mail</span>
              <strong>{STORE.email}</strong>
              <small>Respondemos em até 1 dia útil</small>
            </a>
          )}
        </div>
      ) : null}
      <p>Horário de atendimento: {STORE.hours}.</p>

      <h2>Para agilizar</h2>
      <ul>
        <li>Tenha em mãos o <b>número do pedido</b> (começa com &quot;NF&quot; e aparece na tela de confirmação da compra).</li>
        <li>Para trocas e defeitos, se puder, envie uma foto da peça e da etiqueta.</li>
        <li>Veja também as regras de <Link href="/trocas-e-devolucoes">trocas e devoluções</Link> e de <Link href="/entrega">entrega</Link>.</li>
      </ul>

      {(STORE.legalName || STORE.document || STORE.address) && (
        <>
          <h2>Dados da loja</h2>
          <ul>
            {STORE.legalName && <li>{STORE.legalName}</li>}
            {STORE.document && <li>{STORE.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"}: {STORE.document}</li>}
            {STORE.address && <li>{STORE.address}</li>}
          </ul>
        </>
      )}
    </PolicyPage>
  );
}
