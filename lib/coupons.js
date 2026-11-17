// Regras de cupom (usadas no servidor: checkout, pedidos e painel).

export const SEED_COUPONS = [
  { code: "NEW10", percent: 10 },
  { code: "TREINO15", percent: 15 },
];

export const normalizeCode = (c) => String(c ?? "").trim().toUpperCase();

// Data de hoje no horário de Brasília, no formato AAAA-MM-DD.
export function todayBR(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

export function couponProblem(c, now = new Date()) {
  if (!c) return "Cupom inválido";
  if (!c.active) return "Este cupom não está mais ativo";
  if (c.expires_at && String(c.expires_at).slice(0, 10) < todayBR(now)) return "Este cupom expirou";
  if (c.max_uses != null && c.uses >= c.max_uses) return "Este cupom atingiu o limite de usos";
  return null;
}

// Rótulo curto para a lista do painel.
export function couponStatusLabel(c, now = new Date()) {
  if (!c.active) return "Desativado";
  if (c.expires_at && String(c.expires_at).slice(0, 10) < todayBR(now)) return "Expirado";
  if (c.max_uses != null && c.uses >= c.max_uses) return "Esgotado";
  return "Valendo";
}

export const isCouponUsable = (c, now) => couponProblem(c, now) === null;

export function normalizeCouponInput(input) {
  const errors = {};
  const code = normalizeCode(input.code);
  const percent = Number(input.percent);
  const maxUses = input.max_uses === "" || input.max_uses == null ? null : Number(input.max_uses);
  const expires = String(input.expires_at ?? "").trim() || null;
  if (!/^[A-Z0-9]{3,30}$/.test(code)) errors.code = "Use de 3 a 30 letras e números, sem espaços";
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) errors.percent = "Desconto entre 1% e 90%";
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) errors.max_uses = "Número inteiro (1 ou mais) ou vazio";
  if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) errors.expires_at = "Data inválida";
  return {
    coupon: { code, percent, max_uses: maxUses, expires_at: expires, active: input.active === true || input.active === "on" },
    errors,
  };
}
