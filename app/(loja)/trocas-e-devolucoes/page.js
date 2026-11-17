import Link from "next/link";
import PolicyPage, { ContactLines } from "@/components/PolicyPage";

export const metadata = {
  title: "Trocas e devoluções",
  description: "Troca grátis em até 30 dias, devolução por arrependimento em 7 dias e garantia contra defeitos.",
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      current="/trocas-e-devolucoes"
      title="Trocas e devoluções"
      intro="Queremos que você treine com a peça certa. Se algo não ficou bom, a gente resolve. Veja abaixo como funciona."
    >
      <div className="policy-cards">
        <div><strong>30 dias</strong><span>para trocar tamanho ou cor, com a 1ª troca grátis</span></div>
        <div><strong>7 dias</strong><span>para desistir da compra e receber o dinheiro de volta</span></div>
        <div><strong>90 dias</strong><span>de garantia contra defeitos de fabricação</span></div>
      </div>

      <h2>Troca por tamanho, cor ou modelo</h2>
      <ul>
        <li>Você pode pedir a troca em até <b>30 dias corridos</b> a partir do dia em que recebeu o pedido.</li>
        <li>A <b>primeira troca de cada pedido é grátis</b>: enviamos um código de postagem para você levar o pacote a uma agência dos Correios, sem pagar nada.</li>
        <li>A troca pode ser por outro tamanho, outra cor ou outro produto. Se o novo produto for mais caro, você paga a diferença; se for mais barato, devolvemos a diferença ou geramos um vale-compras, como preferir.</li>
        <li>Se o tamanho ou a cor que você quer estiver esgotado, oferecemos outro produto, um vale-compras ou o reembolso.</li>
      </ul>

      <h2>Desistência da compra (direito de arrependimento)</h2>
      <p>
        Pelo Código de Defesa do Consumidor (art. 49), em compras pela internet você pode desistir em até <b>7 dias corridos</b> a
        partir do recebimento, sem precisar explicar o motivo. Nesse caso, devolvemos <b>todo o valor pago, incluindo o frete</b>, e o
        envio de volta é por nossa conta.
      </p>

      <h2>Produto com defeito</h2>
      <ul>
        <li>Você tem até <b>90 dias</b> a partir do recebimento para avisar sobre defeitos de fabricação (art. 26 do Código de Defesa do Consumidor).</li>
        <li>Recebemos a peça, analisamos e, em até 30 dias, enviamos uma peça nova igual. Se não houver peça igual, você escolhe entre outro produto, um vale-compras ou o dinheiro de volta.</li>
        <li>O envio de volta da peça com defeito é por nossa conta.</li>
        <li>Não são considerados defeitos: desgaste natural pelo uso, danos por lavagem fora das instruções da etiqueta (como água quente, alvejante ou secadora) e ajustes ou consertos feitos por terceiros.</li>
      </ul>

      <h2>Condições para troca e devolução</h2>
      <p>Para trocas e desistências, a peça precisa estar:</p>
      <ul>
        <li>sem sinais de uso, lavagem, odor ou manchas (provar é permitido);</li>
        <li>com a etiqueta original presa;</li>
        <li>de preferência na embalagem original, junto com todos os itens que vieram com ela.</li>
      </ul>
      <p>
        Por higiene, pedimos que tops e peças de contato direto com a pele sejam provados por cima de uma peça íntima. Peças que
        chegarem fora dessas condições serão devolvidas a você, e avisaremos o motivo.
      </p>

      <h2>Como pedir</h2>
      <ol>
        <li>Fale com a gente informando o <b>número do pedido</b> (começa com &quot;NF&quot;, aparece na tela de confirmação da compra), a peça e o motivo.</li>
        <li>Respondemos em até 2 dias úteis com o código de postagem e as instruções.</li>
        <li>Embale bem a peça e leve a uma agência dos Correios em até 7 dias depois de receber o código.</li>
        <li>Quando a peça chegar, conferimos e, em até 3 dias úteis, enviamos a peça nova ou fazemos o reembolso.</li>
      </ol>
      <ContactLines />

      <h2>Como o reembolso é feito</h2>
      <ul>
        <li><b>Pix:</b> devolvemos por Pix, na chave que você indicar, em até 5 dias úteis depois de recebermos a peça.</li>
        <li><b>Cartão de crédito:</b> pedimos o estorno à operadora em até 5 dias úteis. O valor aparece na sua fatura em até 2 faturas, conforme o banco.</li>
        <li><b>Boleto:</b> devolvemos por Pix ou transferência para uma conta no seu nome.</li>
        <li>Se preferir, você pode receber um <b>vale-compras</b> com o valor, para usar na loja.</li>
      </ul>

      <h2>Pedido ainda não enviado</h2>
      <p>
        Se o pedido ainda não saiu para entrega, você pode cancelar falando com a gente. O reembolso segue as regras acima. Se já
        tiver sido enviado, é só recusar a entrega ou seguir o passo a passo de desistência.
      </p>

      <p className="policy-foot">
        Dúvidas? Veja também <Link href="/entrega">Entrega e frete</Link> e <Link href="/termos">Termos de uso</Link>.
      </p>
    </PolicyPage>
  );
}
