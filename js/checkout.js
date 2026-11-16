// ===== Checkout em etapas (demonstração: nenhum pagamento real é feito) =====
const SHIP_OPTIONS = {
  pac: { label: "PAC (Correios)", eta: "5 a 8 dias úteis", price: (base) => (base >= FREE_SHIPPING ? 0 : SHIPPING_COST) },
  sedex: { label: "SEDEX", eta: "1 a 3 dias úteis", price: () => 39.9 },
  retirada: { label: "Retirar na loja", eta: "Pronto em até 2 horas", price: () => 0 },
};
const PIX_DISCOUNT = 0.05;
const MAX_INSTALLMENTS = 6;
const STEPS = ["Dados", "Entrega", "Pagamento"];

const ck = { step: 1, data: {}, ship: "pac", pay: "pix", installments: 1, order: null };

const MASKS = {
  cpf: (v) => v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  tel: (v) => v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2"),
  cep: (v) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  card: (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  validade: (v) => v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2"),
  cvv: (v) => v.replace(/\D/g, "").slice(0, 4),
  uf: (v) => v.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase(),
};

function validCPF(value) {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(d[len])) return false;
  }
  return true;
}

const RULES = {
  nome: (v) => v.trim().split(/\s+/).length >= 2 || "Informe nome e sobrenome",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail inválido",
  tel: (v) => v.replace(/\D/g, "").length >= 10 || "Telefone com DDD",
  cpf: (v) => validCPF(v) || "CPF inválido",
  cep: (v) => v.replace(/\D/g, "").length === 8 || "CEP com 8 dígitos",
  rua: (v) => v.trim().length > 2 || "Informe a rua",
  numero: (v) => v.trim().length > 0 || "Obrigatório",
  bairro: (v) => v.trim().length > 1 || "Informe o bairro",
  cidade: (v) => v.trim().length > 1 || "Informe a cidade",
  uf: (v) => v.length === 2 || "UF",
  card: (v) => v.replace(/\D/g, "").length >= 13 || "Número do cartão inválido",
  cardName: (v) => v.trim().length > 3 || "Nome como está no cartão",
  validade: (v) => {
    const [m, y] = v.split("/").map(Number);
    if (!m || m > 12 || y === undefined || v.length !== 5) return "MM/AA";
    const exp = new Date(2000 + y, m); // primeiro dia do mês seguinte
    return exp > new Date() || "Cartão vencido";
  },
  cvv: (v) => v.length >= 3 || "CVV",
};

function field(name, label, opts = {}) {
  const v = ck.data[name] ?? "";
  return `<label class="field ${opts.cls || ""}">
    <span>${label}</span>
    <input id="ck-${name}" name="${name}" value="${String(v).replace(/"/g, "&quot;")}"
      ${opts.type ? `type="${opts.type}"` : ""} ${opts.mode ? `inputmode="${opts.mode}"` : ""}
      ${opts.auto ? `autocomplete="${opts.auto}"` : ""} ${opts.ph ? `placeholder="${opts.ph}"` : ""} />
    <small class="err" data-err="${name}"></small>
  </label>`;
}

function checkoutTotals() {
  const t = totals();
  const base = t.subtotal - t.discount;
  const shipping = ck.step >= 2 ? SHIP_OPTIONS[ck.ship].price(base) : t.shipping;
  const pix = ck.pay === "pix" && ck.step >= 3 ? base * PIX_DISCOUNT : 0;
  return { ...t, shipping, pix, total: base - pix + shipping };
}

function stepBody() {
  if (ck.step === 1) return `
    <h3>Seus dados</h3>
    <div class="form-grid">
      ${field("nome", "Nome completo", { cls: "full", auto: "name" })}
      ${field("email", "E-mail", { type: "email", auto: "email", ph: "voce@email.com" })}
      ${field("tel", "Celular", { mode: "tel", auto: "tel", ph: "(11) 99999-9999" })}
      ${field("cpf", "CPF", { mode: "numeric", ph: "000.000.000-00" })}
    </div>`;

  if (ck.step === 2) {
    const base = totals().subtotal - totals().discount;
    return `
    <h3>Entrega</h3>
    <div class="form-grid">
      ${field("cep", "CEP", { mode: "numeric", auto: "postal-code", ph: "00000-000" })}
      <p class="cep-hint" id="cepHint">Digite o CEP para preencher o endereço.</p>
      ${field("rua", "Rua / Avenida", { cls: "full", auto: "address-line1" })}
      ${field("numero", "Número", { mode: "numeric" })}
      ${field("compl", "Complemento (opcional)", { auto: "address-line2" })}
      ${field("bairro", "Bairro")}
      ${field("cidade", "Cidade", { auto: "address-level2" })}
      ${field("uf", "UF", { auto: "address-level1", ph: "SP" })}
    </div>
    <p class="opt-label">Forma de envio</p>
    <div class="radio-list">
      ${Object.entries(SHIP_OPTIONS).map(([k, o]) => {
        const price = o.price(base);
        return `<label class="radio ${ck.ship === k ? "active" : ""}">
          <input type="radio" name="ship" value="${k}" ${ck.ship === k ? "checked" : ""} />
          <span><b>${o.label}</b><small>${o.eta}</small></span>
          <strong>${price ? brl(price) : "Grátis"}</strong>
        </label>`;
      }).join("")}
    </div>`;
  }

  if (ck.step === 3) {
    const t = checkoutTotals();
    const base = t.subtotal - t.discount + t.shipping;
    return `
    <h3>Pagamento</h3>
    <div class="pay-tabs" role="tablist">
      ${[["pix", "Pix", "5% OFF"], ["card", "Cartão", "até 6x"], ["boleto", "Boleto", "3 dias"]].map(([k, l, s]) =>
        `<button type="button" role="tab" class="pay-tab ${ck.pay === k ? "active" : ""}" data-pay="${k}" aria-selected="${ck.pay === k}">
          <b>${l}</b><small>${s}</small></button>`).join("")}
    </div>
    ${ck.pay === "pix" ? `<p class="pay-note">Você ganha <b>5% de desconto</b> nos produtos. O código Pix aparece depois de confirmar o pedido e vale por 30 minutos.</p>` : ""}
    ${ck.pay === "boleto" ? `<p class="pay-note">O boleto vence em 3 dias úteis. O pedido é separado após a compensação (até 2 dias úteis).</p>` : ""}
    ${ck.pay === "card" ? `
      <div class="form-grid">
        ${field("card", "Número do cartão", { cls: "full", mode: "numeric", auto: "cc-number", ph: "0000 0000 0000 0000" })}
        ${field("cardName", "Nome impresso no cartão", { cls: "full", auto: "cc-name" })}
        ${field("validade", "Validade", { mode: "numeric", auto: "cc-exp", ph: "MM/AA" })}
        ${field("cvv", "CVV", { mode: "numeric", auto: "cc-csc", ph: "123" })}
        <label class="field full"><span>Parcelas</span>
          <select id="ck-installments">${Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) =>
            `<option value="${n}" ${ck.installments === n ? "selected" : ""}>${n}x de ${brl(base / n)} sem juros</option>`).join("")}
          </select>
        </label>
      </div>` : ""}
    <p class="demo-note">Ambiente de demonstração: nenhum pagamento real é processado.</p>`;
  }
}

function summaryHTML() {
  const t = checkoutTotals();
  return `
    <h4>Resumo do pedido</h4>
    <ul class="sum-items">
      ${state.cart.map((i) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return `<li><div class="thumb sm" data-bg="${i.color}">${productArt(p, i.color)}<span class="q">${i.qty}</span></div>
          <div><p>${p.name}</p><small>${COLORS[i.color].name} · ${i.size}</small></div>
          <strong>${brl(p.price * i.qty)}</strong></li>`;
      }).join("")}
    </ul>
    <dl class="totals">
      <div><dt>Subtotal</dt><dd>${brl(t.subtotal)}</dd></div>
      ${t.discount ? `<div class="disc"><dt>Cupom ${state.coupon}</dt><dd>− ${brl(t.discount)}</dd></div>` : ""}
      ${t.pix ? `<div class="disc"><dt>Desconto Pix</dt><dd>− ${brl(t.pix)}</dd></div>` : ""}
      <div><dt>Frete${ck.step >= 2 ? ` · ${SHIP_OPTIONS[ck.ship].label}` : ""}</dt><dd>${t.shipping ? brl(t.shipping) : "Grátis"}</dd></div>
      <div class="grand"><dt>Total</dt><dd>${brl(t.total)}</dd></div>
    </dl>`;
}

function renderCheckout() {
  const modal = $("#checkoutModal");
  if (ck.order) return renderConfirmation();
  modal.innerHTML = `
    <button class="icon-btn modal-close" data-ck-close aria-label="Fechar">✕</button>
    <div class="ck-main">
      <ol class="stepper">
        ${STEPS.map((s, i) => `<li class="${i + 1 === ck.step ? "current" : i + 1 < ck.step ? "done" : ""}"><span>${i + 1 < ck.step ? "✓" : i + 1}</span>${s}</li>`).join("")}
      </ol>
      <form id="ckForm" novalidate>
        ${stepBody()}
        <div class="ck-actions">
          ${ck.step > 1 ? `<button type="button" class="btn btn-ghost" data-ck-back>Voltar</button>` : `<span></span>`}
          <button type="submit" class="btn btn-primary">${ck.step === 3 ? "Confirmar pedido" : "Continuar"}</button>
        </div>
      </form>
    </div>
    <aside class="ck-summary" id="ckSummary">${summaryHTML()}</aside>`;
}

function renderConfirmation() {
  const o = ck.order;
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136newfitness-demo-${o.number}5204000053039865406${o.total.toFixed(2)}5802BR5910NEWFITNESS6009SAO PAULO`;
  $("#checkoutModal").innerHTML = `
    <button class="icon-btn modal-close" data-ck-close aria-label="Fechar">✕</button>
    <div class="ck-done">
      <div class="done-badge">✓</div>
      <p class="eyebrow">Pedido ${o.number}</p>
      <h2>Valeu, ${o.firstName}!</h2>
      <p class="muted">Enviamos a confirmação para <b>${o.email}</b>. Total: <b>${brl(o.total)}</b> · ${o.shipLabel} (${o.eta}).</p>
      ${o.pay === "pix" ? `
        <div class="pix-box">
          <p>Pix copia e cola (demonstração)</p>
          <code id="pixCode">${pixCode}</code>
          <button class="btn btn-primary small" data-copy-pix>Copiar código</button>
        </div>` : ""}
      ${o.pay === "boleto" ? `<p class="pay-note">O boleto foi enviado para o seu e-mail e vence em 3 dias úteis.</p>` : ""}
      ${o.pay === "card" ? `<p class="pay-note">Pagamento aprovado em ${o.installments}x de ${brl(o.total / o.installments)}.</p>` : ""}
      <button class="btn btn-ghost" data-ck-close>Continuar comprando</button>
    </div>`;
}

function validateStep() {
  const form = $("#ckForm");
  let ok = true;
  let first;
  form.querySelectorAll("input[name]:not([type=radio])").forEach((input) => {
    const rule = RULES[input.name];
    if (!rule) return;
    const res = rule(input.value);
    const msg = res === true ? "" : res;
    form.querySelector(`[data-err="${input.name}"]`).textContent = msg;
    input.classList.toggle("invalid", !!msg);
    if (msg) { ok = false; first ??= input; }
  });
  first?.focus();
  return ok;
}

async function lookupCEP(cep) {
  const hint = $("#cepHint");
  try {
    hint.textContent = "Buscando endereço…";
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();
    if (d.erro) throw new Error();
    Object.assign(ck.data, { rua: d.logradouro, bairro: d.bairro, cidade: d.localidade, uf: d.uf });
    ["rua", "bairro", "cidade", "uf"].forEach((k) => { const el = $(`#ck-${k}`); if (el && ck.data[k]) el.value = ck.data[k]; });
    hint.textContent = "Endereço encontrado. Confira e informe o número.";
    $("#ck-numero")?.focus();
  } catch {
    hint.textContent = "Não foi possível buscar o CEP. Preencha o endereço manualmente.";
  }
}

function openCheckout() {
  if (!state.cart.length) return;
  ck.step = 1;
  ck.order = null;
  closeCart();
  renderCheckout();
  $("#checkoutModal").showModal();
}

function placeOrder() {
  const t = checkoutTotals();
  ck.order = {
    number: "NF" + String(Date.now()).slice(-6),
    firstName: ck.data.nome.trim().split(/\s+/)[0],
    email: ck.data.email,
    total: t.total,
    pay: ck.pay,
    installments: ck.pay === "card" ? ck.installments : 1,
    shipLabel: SHIP_OPTIONS[ck.ship].label,
    eta: SHIP_OPTIONS[ck.ship].eta,
  };
  delete ck.data.card; delete ck.data.cvv; delete ck.data.validade; delete ck.data.cardName;
  state.cart = [];
  state.coupon = null;
  save();
  renderCart();
  renderConfirmation();
}

const ckModal = $("#checkoutModal");

ckModal.addEventListener("input", (e) => {
  const el = e.target;
  if (el.name && MASKS[el.name]) el.value = MASKS[el.name](el.value);
  if (el.name && el.type !== "radio") ck.data[el.name] = el.value;
  if (el.classList.contains("invalid")) {
    const res = RULES[el.name]?.(el.value);
    if (res === true) { el.classList.remove("invalid"); ckModal.querySelector(`[data-err="${el.name}"]`).textContent = ""; }
  }
  if (el.name === "cep" && el.value.replace(/\D/g, "").length === 8) lookupCEP(el.value.replace(/\D/g, ""));
});

ckModal.addEventListener("change", (e) => {
  if (e.target.name === "ship") {
    ck.ship = e.target.value;
    ckModal.querySelectorAll(".radio").forEach((r) => r.classList.toggle("active", r.querySelector("input").checked));
    $("#ckSummary").innerHTML = summaryHTML();
  }
  if (e.target.id === "ck-installments") ck.installments = Number(e.target.value);
});

ckModal.addEventListener("click", (e) => {
  const t = e.target;
  if (t === ckModal || t.closest("[data-ck-close]")) return ckModal.close();
  if (t.closest("[data-ck-back]")) { ck.step--; return renderCheckout(); }
  const tab = t.closest("[data-pay]");
  if (tab) { ck.pay = tab.dataset.pay; return renderCheckout(); }
  if (t.closest("[data-copy-pix]")) {
    const code = $("#pixCode").textContent;
    navigator.clipboard?.writeText(code).then(() => toast("Código Pix copiado"), () => {
      getSelection().selectAllChildren($("#pixCode"));
      toast("Selecionado: use Ctrl+C para copiar");
    });
  }
});

ckModal.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateStep()) return;
  if (ck.step < 3) { ck.step++; renderCheckout(); ckModal.scrollTop = 0; return; }
  placeOrder();
});
