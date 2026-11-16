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
| `/admin` | Painel: pedidos, produtos, preços e estoque (com senha) |
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

O pagamento ainda é **simulado**: nenhuma cobrança real é feita.

## Painel de administração e banco de dados

Configuração (veja `.env.example`):

| Variável | Para quê |
| --- | --- |
| `ADMIN_PASSWORD` | Senha do painel. Sem ela, o painel fica trancado no site publicado. No seu computador (`npm run dev`) a senha padrão é `admin`. |
| `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` | Liga o banco de dados. Sem elas, a loja roda em **modo demonstração** (dados de exemplo na memória, que somem quando o servidor reinicia). |

### Ligando o Supabase

1. Crie um projeto em https://supabase.com (região South America - São Paulo).
2. Em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **service_role**.
4. Na Vercel, em **Settings → Environment Variables**, cadastre `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_PASSWORD`, e faça um novo deploy.
5. Entre em `/admin/produtos` e clique em **Importar produtos de exemplo** (ou cadastre do zero).

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
supabase/schema.sql   estrutura do banco
middleware.js         protege o /admin
tests/                testes automáticos
```

## Próximos passos

1. Fotos reais dos produtos (substituir as silhuetas em `components/ProductArt.js`)
2. Ligar o Supabase (passo a passo acima)
3. Pagamento real com Mercado Pago (Pix, cartão e boleto) e frete real (Melhor Envio)
4. Publicar o site (ex.: Vercel) com domínio próprio
