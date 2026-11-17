// POST /api/orders: recebe a sacola e os dados do cliente, valida tudo e recalcula o
// total no servidor. Os preços enviados pelo navegador são ignorados de propósito.
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { OutOfStockError, db } from "@/lib/db";
import { currentCustomer } from "@/lib/session";
import { normalizeColor } from "@/lib/colors";
import { couponProblem, normalizeCode } from "@/lib/coupons";
import { MAX_INSTALLMENTS, PAY_OPTIONS, SHIP_OPTIONS, cartTotals } from "@/lib/pricing";
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

  const customerAccount = await currentCustomer();
  if (!customerAccount) return bad("Entre na sua conta para finalizar a compra.", 401);
  if (!Array.isArray(items) || items.length === 0) return bad("A sacola está vazia");
  const catalog = await db.listProducts();
  for (const i of items) {
    if (i && typeof i.color === "string") i.color = normalizeColor(i.color);
    const p = catalog.find((x) => x.id === i?.id);
    if (!p) return bad("Produto não encontrado");
    if (!p.colors.includes(i.color) || !p.sizes.includes(i.size)) return bad(`Cor ou tamanho indisponível: ${p.name}`);
    if (!Number.isInteger(i.qty) || i.qty < 1 || i.qty > MAX_QTY) return bad("Quantidade inválida");
  }
  if (!SHIP_OPTIONS[ship]) return bad("Forma de envio inválida");
  if (!PAY_OPTIONS[pay]) return bad("Forma de pagamento inválida");
  let couponObj = null;
  if (coupon) {
    const c = await db.getCoupon(normalizeCode(coupon)).catch(() => null);
    const problem = couponProblem(c);
    if (problem) return bad(`${problem}. Remova o cupom da sacola e tente de novo.`, 409);
    couponObj = { code: c.code, percent: c.percent };
  }
  if (!Number.isInteger(installments) || installments < 1 || installments > MAX_INSTALLMENTS) return bad("Parcelamento inválido");

  const errors = validate([...STEP_FIELDS[1], ...STEP_FIELDS[2]], customer);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Confira seus dados", fields: errors }, { status: 422 });

  const cart = items.map(({ id, color, size, qty }) => ({ key: `${id}-${color}-${size}`, id, color, size, qty }));
  const t = cartTotals(cart, couponObj, { ship, pay }, catalog);
  const number = "NF" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 10);

  // Conta o uso do cupom (falha se outro pedido usou o último uso disponível).
  if (couponObj && !(await db.useCoupon(couponObj.code))) {
    return bad("Este cupom atingiu o limite de usos. Remova o cupom da sacola e tente de novo.", 409);
  }

  // Baixa o estoque de todos os itens de uma vez; se faltar algum, nada é baixado.
  try {
    await db.reserveStock(cart);
  } catch (e) {
    if (e instanceof OutOfStockError) {
      const name = catalog.find((p) => p.id === e.productId)?.name ?? "um produto";
      return bad(`Acabou o estoque de ${name}. Ajuste a sacola e tente de novo.`, 409);
    }
    throw e;
  }

  // TODO (próxima etapa): criar a cobrança no Mercado Pago.
  const { nome, email, tel, cpf, cep, rua, numero: num, compl, bairro, cidade, uf } = customer;
  await db.createOrder({
    number,
    customer_id: customerAccount.id,
    status: "novo",
    customer: { nome, email, tel, cpf, cep, rua, numero: num, compl: compl ?? "", bairro, cidade, uf },
    items: t.lines.map((l) => ({ id: l.id, name: l.product.name, color: l.color, size: l.size, qty: l.qty, price: l.product.price })),
    ship, pay,
    installments: pay === "card" ? installments : 1,
    coupon: couponObj?.code ?? null,
    subtotal: t.subtotal, discount: t.discount, pix_discount: t.pix, shipping: t.shipping, total: t.total,
  });
  revalidatePath("/", "layout"); // atualiza o estoque mostrado na loja

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
