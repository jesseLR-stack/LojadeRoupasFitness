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

O pagamento ainda é **simulado**: nenhuma cobrança real é feita.

## Estrutura

```
app/                  páginas e rotas (Next.js App Router)
  page.js             página inicial + loja
  produto/[slug]/     página de cada produto
  checkout/           finalizar compra
  api/orders/         API de pedidos
  api/products/       API do catálogo
  globals.css         visual (tema escuro + verde-limão)
components/           partes da interface (topo, sacola, cartão de produto, checkout…)
lib/
  products.js         catálogo de exemplo
  pricing.js          preços, cupons, frete e Pix (usado no navegador e no servidor)
  validation.js       máscaras e validações
tests/                testes automáticos
```

## Próximos passos

1. Fotos reais dos produtos (substituir as silhuetas em `components/ProductArt.js`)
2. Banco de dados e painel de administração para cadastrar produtos, preços e estoque (ex.: Supabase)
3. Pagamento real com Mercado Pago (Pix, cartão e boleto) e frete real (Melhor Envio)
4. Publicar o site (ex.: Vercel) com domínio próprio
