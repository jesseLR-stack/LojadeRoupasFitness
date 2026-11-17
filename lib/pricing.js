// Regras de preço, frete e pagamento. Usado no navegador (para mostrar valores)
// e no servidor (para recalcular o pedido sem confiar no que o navegador enviou).
export const FREE_SHIPPING = 299;
export const SHIPPING_COST = 24.9;
export const PIX_DISCOUNT = 0.05;
export const MAX_INSTALLMENTS = 6;

export const SHIP_OPTIONS = {
  pac: { label: "PAC (Correios)", eta: "5 a 8 dias úteis", price: (base) => (base >= FREE_SHIPPING ? 0 : SHIPPING_COST) },
  sedex: { label: "SEDEX", eta: "1 a 3 dias úteis", price: () => 39.9 },
  retirada: { label: "Retirar na loja", eta: "Pronto em até 2 horas", price: () => 0 },
};

export const PAY_OPTIONS = {
  pix: { label: "Pix", hint: "5% OFF" },
  card: { label: "Cartão", hint: `até ${MAX_INSTALLMENTS}x` },
  boleto: { label: "Boleto", hint: "3 dias" },
};

const round = (v) => Math.round(v * 100) / 100;

export const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Calcula os totais da sacola a partir do catálogo (lista de produtos).
 * `coupon` é { code, percent } (já validado) ou null.
 * Sem `ship`, usa o frete padrão (PAC). Sem `pay`, não aplica o desconto do Pix.
 */
export function cartTotals(cart, coupon, { ship, pay } = {}, catalog = []) {
  const lines = cart
    .map((i) => ({ ...i, product: catalog.find((p) => p.id === i.id) }))
    .filter((l) => l.product);
  const subtotal = round(lines.reduce((s, l) => s + l.product.price * l.qty, 0));
  const discount = round(coupon?.percent ? (subtotal * coupon.percent) / 100 : 0);
  const base = round(subtotal - discount);
  const shipping = subtotal === 0 ? 0 : SHIP_OPTIONS[ship ?? "pac"].price(base);
  const pix = round(pay === "pix" ? base * PIX_DISCOUNT : 0);
  return { lines, subtotal, discount, base, shipping, pix, total: round(base - pix + shipping) };
}
