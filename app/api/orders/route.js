// POST /api/orders: recebe a sacola e os dados do cliente, valida tudo e recalcula o
// total no servidor. Os preços enviados pelo navegador são ignorados de propósito.
import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { COUPONS, MAX_INSTALLMENTS, PAY_OPTIONS, SHIP_OPTIONS, cartTotals } from "@/lib/pricing";
import { STEP_FIELDS, validate } from "@/lib/validation";

const MAX_QTY = 20;

function bad(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Pedido inválido");
  }
  const { items, coupon = null, ship, pay, installments = 1, customer = {} } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) return bad("A sacola está vazia");
  for (const i of items) {
    const p = getProductById(i?.id);
    if (!p) return bad("Produto não encontrado");
    if (!p.colors.includes(i.color) || !p.sizes.includes(i.size)) return bad(`Cor ou tamanho indisponível: ${p.name}`);
    if (!Number.isInteger(i.qty) || i.qty < 1 || i.qty > MAX_QTY) return bad("Quantidade inválida");
  }
  if (!SHIP_OPTIONS[ship]) return bad("Forma de envio inválida");
  if (!PAY_OPTIONS[pay]) return bad("Forma de pagamento inválida");
  if (coupon !== null && !COUPONS[coupon]) return bad("Cupom inválido");
  if (!Number.isInteger(installments) || installments < 1 || installments > MAX_INSTALLMENTS) return bad("Parcelamento inválido");

  const errors = validate([...STEP_FIELDS[1], ...STEP_FIELDS[2]], customer);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Confira seus dados", fields: errors }, { status: 422 });

  const cart = items.map(({ id, color, size, qty }) => ({ key: `${id}-${color}-${size}`, id, color, size, qty }));
  const t = cartTotals(cart, coupon, { ship, pay });
  const number = "NF" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 10);

  // TODO (próxima etapa): salvar o pedido no banco e criar a cobrança no Mercado Pago.
  const order = {
    number,
    firstName: customer.nome.trim().split(/\s+/)[0],
    email: customer.email,
    total: t.total,
    pay,
    installments: pay === "card" ? installments : 1,
    shipLabel: SHIP_OPTIONS[ship].label,
    eta: SHIP_OPTIONS[ship].eta,
    pixCode: pay === "pix" ? `00020126580014BR.GOV.BCB.PIX0136newfitness-demo-${number}52040000530398654${String(t.total.toFixed(2).length).padStart(2, "0")}${t.total.toFixed(2)}5802BR5910NEWFITNESS6009SAO PAULO` : null,
  };

  return NextResponse.json({ order }, { status: 201 });
}
