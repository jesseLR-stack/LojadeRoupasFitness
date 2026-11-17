import Link from "next/link";
import PolicyPage, { ContactLines } from "@/components/PolicyPage";
import { MAX_INSTALLMENTS, PIX_DISCOUNT } from "@/lib/pricing";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Termos de uso",
  description: "Regras de uso do site e das compras na NewFitness: preços, pagamentos, cupons, cancelamentos e atendimento.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      current="/termos"
      title="Termos de uso"
      intro="Estes termos explicam as regras para usar o site e comprar na NewFitness. Ao finalizar um pedido, você concorda com eles."
    >
      <h2>Quem somos</h2>
      <p>
        Este site é operado por {STORE.legalName || STORE.name}
        {STORE.document && <>, {STORE.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"} {STORE.document}</>}
        {STORE.address && <>, {STORE.address}</>}. As compras seguem o Código de Defesa do Consumidor (Lei 8.078/1990) e o Decreto
        7.962/2013, sobre comércio eletrônico.
      </p>

      <h2>Conta na loja</h2>
      <ul>
        <li>Qualquer pessoa pode navegar e ver os produtos. Para comprar, é preciso ter uma conta, criada com nome, e-mail e senha.</li>
        <li>A conta permite acompanhar o andamento dos pedidos e avaliar os produtos recebidos.</li>
        <li>Mantenha sua senha em segredo. Compras feitas com a sua conta são consideradas suas.</li>
      </ul>

      <h2>Produtos, fotos e tamanhos</h2>
      <ul>
        <li>Fazemos o possível para que fotos e cores sejam fiéis, mas a cor pode variar um pouco conforme a tela do seu aparelho.</li>
        <li>Consulte o guia de tamanhos na página de cada produto. Se o tamanho não servir, a <Link href="/trocas-e-devolucoes">troca é grátis em até 30 dias</Link>.</li>
        <li>Os produtos estão sujeitos à disponibilidade em estoque.</li>
      </ul>

      <h2>Preços e pagamento</h2>
      <ul>
        <li>Os preços estão em reais (R$) e valem para compras no site. O total do pedido, com frete e descontos, aparece antes de você confirmar.</li>
        <li>Formas de pagamento: Pix (com {PIX_DISCOUNT * 100}% de desconto nos produtos), cartão de crédito em até {MAX_INSTALLMENTS}x sem juros e boleto.</li>
        <li>O pedido só é separado e enviado depois da confirmação do pagamento. Se o pagamento não for confirmado no prazo (30 minutos para Pix, 3 dias úteis para boleto), o pedido é cancelado automaticamente.</li>
        <li>Pedidos podem passar por análise de segurança para evitar fraudes. Se não for possível confirmar a compra, ela é cancelada e o valor, devolvido integralmente.</li>
        <li>Se um preço aparecer com um erro evidente (por exemplo, um valor muito abaixo do real por falha do sistema), avisaremos você e daremos a opção de confirmar a compra pelo preço correto ou cancelar com reembolso total.</li>
      </ul>

      <h2>Cupons de desconto</h2>
      <ul>
        <li>É possível usar um cupom por pedido. Cupons não se somam entre si.</li>
        <li>Cada cupom tem as regras e a validade informadas na divulgação.</li>
        <li>O desconto do cupom vale sobre os produtos, não sobre o frete.</li>
      </ul>

      <h2>Entrega, trocas e cancelamento</h2>
      <p>
        Os prazos e valores de entrega estão em <Link href="/entrega">Entrega e frete</Link>. As regras de troca, desistência em 7
        dias e garantia estão em <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>.
      </p>

      <h2>Seus dados</h2>
      <p>
        Usamos seus dados apenas para processar e entregar seus pedidos e atender você, conforme a{" "}
        <Link href="/privacidade">Política de privacidade</Link>.
      </p>

      <h2>Conteúdo do site</h2>
      <p>
        Marca, logotipo, textos e fotos deste site pertencem à NewFitness ou são usados com autorização. Não é permitido copiá-los
        para uso comercial sem permissão.
      </p>

      <h2>Atendimento e reclamações</h2>
      <p>Antes de qualquer coisa, fale com a gente. A maioria dos problemas se resolve rápido por aqui:</p>
      <ContactLines />
      <p>
        Você também pode registrar uma reclamação na plataforma pública <b>consumidor.gov.br</b> ou no Procon da sua cidade.
      </p>

      <h2>Mudanças nestes termos</h2>
      <p>
        Podemos atualizar estes termos. Cada compra segue os termos válidos na data em que foi feita. Fica eleito o foro do domicílio
        do consumidor para resolver eventuais questões.
      </p>
    </PolicyPage>
  );
}
