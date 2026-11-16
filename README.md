# NewFitness — Loja de Roupas Fitness

Protótipo de e-commerce focado exclusivamente em moda fitness (leggings, tops, shorts, regatas, camisetas e jaquetas).

## Como rodar

Não precisa instalar nada: abra o `index.html` no navegador.

## O que já funciona

- Hero animado, faixa de categorias, coleções por modalidade (Musculação, Corrida, Yoga & Pilates, Cross)
- Catálogo com busca, filtro por categoria, gênero e modalidade, e ordenação
- Página rápida do produto (modal) com escolha de cor e tamanho
- Sacola lateral com quantidades, barra de frete grátis, cupons (`NEW10`, `TREINO15`) e total
- Sacola e favoritos salvos no navegador (localStorage)
- Favoritos: coração em cada produto, contador no topo e filtro "Favoritos"
- Guia de tamanhos com tabela de medidas (busto, cintura, quadril)
- Sugestões "Combina com" na página do produto
- Finalizar compra em 3 etapas (dados, entrega e pagamento) com:
  - máscaras e validação (CPF, celular, CEP, cartão, validade)
  - busca automática de endereço pelo CEP (ViaCEP)
  - frete PAC / SEDEX / retirada na loja
  - Pix com 5% OFF, cartão em até 6x sem juros ou boleto
  - tela de confirmação com número do pedido e Pix copia e cola (demonstração)
- Layout responsivo (desktop, tablet, celular)

## Estrutura

```
index.html        página principal
css/styles.css    visual (tema escuro + verde‑lima)
js/products.js    catálogo de produtos (dados de exemplo)
js/app.js         lógica: filtros, favoritos, modal, sacola, cupons
js/checkout.js    finalizar compra em etapas (simulado)
```

## Próximos passos sugeridos

1. Fotos reais dos produtos (substituir as silhuetas SVG)
2. Migrar para Next.js + Tailwind (SEO e páginas por produto)
3. Back-end/painel admin para cadastrar produtos e estoque (ex.: Supabase ou Medusa.js)
4. Ligar o checkout a um pagamento real (Mercado Pago ou Stripe) e ao cálculo de frete real (Melhor Envio)
5. Login de clientes, histórico de pedidos e avaliações
