import Link from "next/link";
import PolicyPage, { ContactLines } from "@/components/PolicyPage";
import { FREE_SHIPPING, SHIPPING_COST, SHIP_OPTIONS, brl } from "@/lib/pricing";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Entrega e frete",
  description: "Prazos de envio, valores de frete, frete grátis acima de R$ 299 e rastreamento do pedido.",
};

export default function ShippingPage() {
  const sedex = SHIP_OPTIONS.sedex.price(0);
  return (
    <PolicyPage
      current="/entrega"
      title="Entrega e frete"
      intro="Enviamos para todo o Brasil. Veja os prazos, os valores e como acompanhar o seu pedido."
    >
      <h2>Formas de envio</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Forma</th><th>Prazo depois do envio</th><th>Valor</th></tr></thead>
          <tbody>
            <tr><td>{SHIP_OPTIONS.pac.label}</td><td>{SHIP_OPTIONS.pac.eta}</td><td>{brl(SHIPPING_COST)} · <b>grátis acima de {brl(FREE_SHIPPING)}</b></td></tr>
            <tr><td>{SHIP_OPTIONS.sedex.label}</td><td>{SHIP_OPTIONS.sedex.eta}</td><td>{brl(sedex)}</td></tr>
            <tr><td>{SHIP_OPTIONS.retirada.label}</td><td>{SHIP_OPTIONS.retirada.eta}, no horário de atendimento</td><td>Grátis</td></tr>
          </tbody>
        </table>
      </div>
      <p className="muted small">
        O frete grátis vale para o PAC em compras a partir de {brl(FREE_SHIPPING)}, já descontados os cupons. Os prazos dos Correios
        são estimativas e podem variar para algumas regiões.
      </p>

      <h2>Quando o pedido é enviado</h2>
      <ul>
        <li>Separamos e postamos o pedido em até <b>1 dia útil</b> depois da confirmação do pagamento.</li>
        <li><b>Pix e cartão:</b> a confirmação costuma ser imediata.</li>
        <li><b>Boleto:</b> a confirmação leva até 2 dias úteis depois do pagamento.</li>
        <li>O prazo de entrega da tabela começa a contar a partir da postagem. Dias úteis não incluem sábados, domingos e feriados.</li>
      </ul>

      <h2>Acompanhando o pedido</h2>
      <p>
        Quando o pedido for postado, enviamos o <b>código de rastreio</b> para o e-mail informado na compra. Com ele, você acompanha
        a entrega pelo site dos Correios.
      </p>

      <h2>Retirada na loja</h2>
      <ul>
        <li>Escolha &quot;{SHIP_OPTIONS.retirada.label}&quot; na finalização da compra.</li>
        <li>Avisamos quando o pedido estiver pronto (em até 2 horas depois da confirmação do pagamento, no horário de atendimento).</li>
        <li>Retire com um documento com foto e o número do pedido. Outra pessoa pode retirar com o número do pedido e um documento do comprador.</li>
        {STORE.address && <li>Endereço: {STORE.address}.</li>}
      </ul>

      <h2>Problemas na entrega</h2>
      <ul>
        <li><b>Endereço:</b> confira com cuidado ao finalizar a compra. Se o pedido voltar por endereço incorreto ou incompleto, o novo envio pode ser cobrado.</li>
        <li><b>Ausência:</b> os Correios fazem até 3 tentativas. Depois disso, o pacote fica disponível para retirada na agência indicada no rastreio por alguns dias.</li>
        <li><b>Atraso, extravio ou pacote violado:</b> não aceite pacotes abertos ou danificados e fale com a gente. Se o pedido se perder, enviamos de novo ou devolvemos o valor, sem custo para você.</li>
      </ul>

      <h2>Precisa de ajuda?</h2>
      <ContactLines />
      <p className="policy-foot">Veja também <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>.</p>
    </PolicyPage>
  );
}
