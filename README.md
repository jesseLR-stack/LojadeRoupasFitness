# NewFitness: loja de roupas fitness

E-commerce focado exclusivamente em moda fitness (leggings, tops, shorts, regatas, camisetas e jaquetas), feito com **Next.js** (React) e JavaScript.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

Depois abra http://localhost:3000.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run build` | Gera a versão otimizada para publicar |
| `npm start` | Roda a versão gerada pelo build |
| `npm test` | Roda os testes das regras de preço, frete e validação |

## Páginas

| Endereço | Conteúdo |
| --- | --- |
| `/` | Início, coleções e loja com busca e filtros |
| `/?genero=feminino#loja` | Loja já filtrada (também `modalidade=corrida`, `favoritos=1`) |
| `/produto/<nome-do-produto>` | Página própria de cada produto |
| `/checkout` | Finalizar compra em 3 etapas |
| `/conta` | Conta do cliente: cadastro, login, "Meus pedidos" com o andamento e avaliação dos produtos recebidos. **Comprar exige conta**; navegar é livre |
| `/sobre` | Sobre a marca |
| `/admin` | Painel (com senha): visão geral com gráficos, pedidos, produtos, cupons e avaliações |
| `/trocas-e-devolucoes`, `/entrega`, `/privacidade`, `/termos`, `/contato` | Políticas da loja e atendimento |
| `/api/products` | Catálogo em JSON |
| `/api/orders` | Recebe pedidos (POST) e recalcula o total no servidor |
| `/sitemap.xml`, `/robots.txt` | Para o Google indexar a loja |

## O que já funciona

- Catálogo com busca, filtros (categoria, gênero, modalidade, favoritos) e ordenação
- Página de cada produto com escolha de cor e tamanho, guia de tamanhos e "Combina com"
- Favoritos e sacola salvos no navegador, cupons (`NEW10`, `TREINO15`) e barra de frete grátis
- Checkout com validação (CPF, celular, CEP, cartão), busca de endereço pelo CEP (ViaCEP), PAC/SEDEX/retirada e Pix/cartão/boleto
- O servidor confere produtos, cores, tamanhos, cupom e dados do cliente e **recalcula o total**: preços alterados no navegador são ignorados
- SEO: título e descrição por página, dados estruturados de produto (preço e avaliação no Google), sitemap

- Painel de administração em `/admin`: cadastrar, editar, ocultar e excluir produtos; preço "de/por"; estoque; ver pedidos e mudar o status (novo, pago, enviado, entregue, cancelado)
- Estoque: produto esgotado não pode ser comprado, e a baixa de estoque é feita de uma vez para o pedido inteiro
- Fotos: até 6 por produto, enviadas pelo painel (reduzidas no navegador antes do envio) e guardadas no Supabase Storage; a primeira é a principal
- Avaliações só aparecem quando existirem avaliações reais (os exemplos não têm notas inventadas)
- Conta do cliente com senha protegida (hash scrypt) e sessão em cookie assinado; pedidos ficam ligados à conta
- Avaliações de clientes: só quem recebeu o pedido (status "Entregue") avalia; o painel pode remover avaliações
- Cupons gerenciados pelo painel: desconto em %, validade, limite de usos, ativar/desativar
- Visão geral do painel: faturamento, ticket médio, faturamento por dia (gráfico), mais vendidos, pedidos por status, estoque baixo

O pagamento ainda é **simulado**: nenhuma cobrança real é feita.

## Painel de administração e banco de dados

Configuração (veja `.env.example`):

| Variável | Para quê |
| --- | --- |
| `ADMIN_PASSWORD` | Senha do painel. Sem ela, o painel fica trancado no site publicado. No seu computador (`npm run dev`) a senha padrão é `admin`. |
| `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` | Liga o banco de dados. Sem elas, a loja roda em **modo demonstração** (dados de exemplo na memória, que somem quando o servidor reinicia). |

| `STORE_LEGAL_NAME`, `STORE_DOCUMENT`, `STORE_ADDRESS`, `STORE_EMAIL`, `STORE_WHATSAPP` | Dados da loja exigidos por lei (Decreto 7.962/2013). Aparecem no rodapé, nas políticas e em "Fale conosco". O painel avisa enquanto faltarem. |

### Ligando o Supabase

1. Crie um projeto em https://supabase.com (região South America - São Paulo).
2. Em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Depois faça o mesmo, nesta ordem, com `supabase/002_fotos_avaliacoes.sql` e `supabase/003_clientes_avaliacoes_cupons.sql`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **service_role**.
4. Na Vercel, em **Settings → Environment Variables**, cadastre `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_PASSWORD`, e faça um novo deploy.
5. Entre em `/admin/produtos` e clique em **Importar produtos de exemplo** (ou cadastre do zero).

## Qualidade (Lighthouse)

Medido com o Lighthouse 12.8 (Google), em 17/11/2026, na versão de produção rodando localmente:

| Página | Desempenho | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Início | 94 | 100 | 100 | 100 |
| Produto | 94 | 100 | 100 | 100 |
| Sobre | 93 | 100 | 100 | 100 |
| Trocas e devoluções | 93 | 100 | 100 | 100 |
| Checkout | 94 | 100 | 100 | 54* |
| Entrar | 94 | 100 | 100 | 54* |

\* Checkout e login são marcados de propósito para não aparecer no Google (`noindex`), e o Lighthouse desconta isso no SEO.

## Estrutura

```
app/                  páginas e rotas (Next.js App Router)
  (loja)/             páginas da loja (com topo, sacola e rodapé)
  admin/              painel de administração
  api/orders/         API de pedidos
  api/products/       API do catálogo
  globals.css         visual (tema escuro + verde-limão)
components/           partes da interface (topo, sacola, cartão de produto, checkout…)
lib/
  db.js               acesso ao banco (Supabase) ou modo demonstração
  auth.js             login do painel
  products.js         categorias, cores e produtos de exemplo
  pricing.js          preços, cupons, frete e Pix (usado no navegador e no servidor)
  validation.js       máscaras e validações
supabase/             estrutura do banco (schema.sql e atualizações 002_…)
middleware.js         protege o /admin
tests/                testes automáticos
```

## Próximos passos

2. Ligar o Supabase (passo a passo acima)
3. Pagamento real com Mercado Pago (Pix, cartão e boleto) e frete real (Melhor Envio)
4. Publicar o site (ex.: Vercel) com domínio próprio
