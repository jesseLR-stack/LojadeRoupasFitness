import PolicyPage, { ContactLines } from "@/components/PolicyPage";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Política de privacidade",
  description: "Quais dados a NewFitness coleta, para que usa, com quem compartilha e como você exerce seus direitos (LGPD).",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      current="/privacidade"
      title="Política de privacidade"
      intro="Esta política explica, de forma simples, quais dados pessoais coletamos, por que coletamos e quais são os seus direitos, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
    >
      <h2>Quem é responsável pelos seus dados</h2>
      <p>
        A responsável pelo tratamento dos seus dados é a {STORE.legalName || STORE.name}
        {STORE.document && <>, inscrita no {STORE.document.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"} sob o nº {STORE.document}</>}
        {STORE.address && <>, com endereço em {STORE.address}</>}.
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li><b>Ao finalizar uma compra:</b> nome, e-mail, celular, CPF e endereço de entrega, além dos produtos, valores e forma de pagamento do pedido.</li>
        <li><b>Dados do cartão:</b> não ficam guardados na loja. Quando o pagamento online estiver ativo, eles serão digitados diretamente no ambiente seguro do intermediador de pagamento.</li>
        <li><b>No seu navegador:</b> a sacola, os favoritos e o cupom ficam salvos só no seu próprio aparelho (armazenamento local), para você não perdê-los ao fechar a página. Não usamos cookies de propaganda nem ferramentas de rastreamento.</li>
        <li><b>Ao falar com a gente:</b> as informações que você enviar por e-mail ou WhatsApp.</li>
      </ul>

      <h2>Para que usamos os dados</h2>
      <ul>
        <li>Processar o pagamento, separar, enviar e entregar o pedido (execução do contrato de compra).</li>
        <li>Emitir documentos fiscais e cumprir obrigações legais. O CPF é pedido por isso e para a nota fiscal e o envio.</li>
        <li>Atender você em trocas, devoluções, garantia e dúvidas.</li>
        <li>Prevenir fraudes e proteger a loja e os clientes (legítimo interesse).</li>
        <li>Enviar novidades e cupons, somente se você pedir e com a opção de cancelar a qualquer momento (consentimento).</li>
      </ul>
      <p>Não vendemos nem alugamos seus dados para ninguém.</p>

      <h2>Com quem compartilhamos</h2>
      <p>Somente com quem precisa dos dados para que a sua compra aconteça:</p>
      <ul>
        <li><b>Transportadora (Correios):</b> nome, endereço e telefone, para a entrega.</li>
        <li><b>Intermediador de pagamento:</b> dados necessários para processar o pagamento e evitar fraudes.</li>
        <li><b>Hospedagem e banco de dados</b> (Vercel e Supabase): guardam o site e os pedidos com segurança. Esses serviços podem ter servidores fora do Brasil e seguem padrões de proteção compatíveis com a LGPD.</li>
        <li><b>Autoridades:</b> quando a lei ou uma ordem judicial exigir.</li>
      </ul>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Os dados dos pedidos ficam guardados por <b>5 anos</b>, prazo exigido pela legislação fiscal e de defesa do consumidor. Depois
        disso, são apagados ou anonimizados. Se você pedir para sair da lista de novidades, seu e-mail é removido dela na hora.
      </p>

      <h2>Seus direitos</h2>
      <p>A qualquer momento, você pode pedir:</p>
      <ul>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos ou desatualizados;</li>
        <li>exclusão, bloqueio ou anonimização de dados desnecessários;</li>
        <li>exclusão dos dados tratados com o seu consentimento e retirada desse consentimento;</li>
        <li>informações sobre com quem compartilhamos;</li>
        <li>portabilidade dos dados.</li>
      </ul>
      <p>
        Respondemos em até 15 dias. Alguns dados podem precisar ser mantidos pelo prazo legal (por exemplo, os de pedidos já
        faturados), mesmo depois de um pedido de exclusão. Você também pode reclamar à Autoridade Nacional de Proteção de Dados
        (ANPD) em gov.br/anpd.
      </p>

      <h2>Segurança</h2>
      <p>
        O site usa conexão criptografada (HTTPS). O acesso aos pedidos é restrito ao painel da loja, protegido por senha, e o banco de
        dados não pode ser acessado publicamente.
      </p>

      <h2>Menores de idade</h2>
      <p>As compras devem ser feitas por maiores de 18 anos ou com a autorização dos pais ou responsáveis.</p>

      <h2>Contato sobre privacidade</h2>
      <p>Para exercer seus direitos ou tirar dúvidas sobre seus dados, fale com a gente:</p>
      <ContactLines />

      <h2>Mudanças nesta política</h2>
      <p>Podemos atualizar esta política. A data da última atualização fica sempre no topo da página.</p>
    </PolicyPage>
  );
}
