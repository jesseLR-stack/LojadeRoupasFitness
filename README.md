# PULSE — Loja de Roupas Fitness

Protótipo de e-commerce focado exclusivamente em moda fitness (leggings, tops, shorts, regatas, camisetas e jaquetas).

## Como rodar

Não precisa instalar nada: abra o `index.html` no navegador.

## O que já funciona

- Hero animado, faixa de categorias, coleções por modalidade (Musculação, Corrida, Yoga & Pilates, Cross)
- Catálogo com busca, filtro por categoria, gênero e modalidade, e ordenação
- Página rápida do produto (modal) com escolha de cor e tamanho
- Sacola lateral com quantidades, barra de frete grátis, cupons (`PULSE10`, `TREINO15`) e total
- Sacola salva no navegador (localStorage)
- Layout responsivo (desktop, tablet, celular)

## Estrutura

```
index.html        página principal
css/styles.css    visual (tema escuro + verde‑lima)
js/products.js    catálogo de produtos (dados de exemplo)
js/app.js         lógica: filtros, modal, sacola, cupons
```

## Próximos passos sugeridos

1. Fotos reais dos produtos (substituir as silhuetas SVG)
2. Migrar para Next.js + Tailwind (SEO e páginas por produto)
3. Back-end/painel admin para cadastrar produtos e estoque (ex.: Supabase ou Medusa.js)
4. Pagamento (Mercado Pago ou Stripe: Pix, cartão e boleto) e cálculo de frete (Melhor Envio)
5. Login de clientes, histórico de pedidos e avaliações
