"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { COLORS } from "@/lib/products";
import { MAX_INSTALLMENTS, PAY_OPTIONS, SHIP_OPTIONS, brl, cartTotals } from "@/lib/pricing";
import { MASKS, RULES, STEP_FIELDS, validate } from "@/lib/validation";
import ProductImage from "./ProductImage";
import { useStore } from "./StoreProvider";

const STEPS = ["Dados", "Entrega", "Pagamento"];

function Field({ name, label, data, errors, onChange, full, ...props }) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <input
        id={`ck-${name}`}
        name={name}
        value={data[name] ?? ""}
        onChange={onChange}
        className={errors[name] ? "invalid" : ""}
        aria-invalid={!!errors[name]}
        {...props}
      />
      {errors[name] && <small className="err">{errors[name]}</small>}
    </label>
  );
}

export default function Checkout() {
  const { ready, catalog, cart, coupon, clearCart, toast } = useStore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [ship, setShip] = useState("pac");
  const [pay, setPay] = useState("pix");
  const [installments, setInstallments] = useState(1);
  const [cepHint, setCepHint] = useState("Digite o CEP para preencher o endereço.");
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const formRef = useRef(null);

  const t = cartTotals(cart, coupon, { ship: step >= 2 ? ship : undefined, pay: step >= 3 ? pay : undefined }, catalog);

  async function lookupCEP(cep) {
    setCepHint("Buscando endereço…");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) throw new Error("CEP não encontrado");
      setData((prev) => ({ ...prev, rua: d.logradouro || prev.rua, bairro: d.bairro || prev.bairro, cidade: d.localidade, uf: d.uf }));
      setCepHint("Endereço encontrado. Confira e informe o número.");
      document.getElementById("ck-numero")?.focus();
    } catch {
      setCepHint("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
    }
  }

  function onChange(e) {
    const { name } = e.target;
    const value = MASKS[name] ? MASKS[name](e.target.value) : e.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] && RULES[name](value) === true) setErrors(({ [name]: _, ...rest }) => rest);
    if (name === "cep" && value.replace(/\D/g, "").length === 8) lookupCEP(value.replace(/\D/g, ""));
  }

  async function submit(e) {
    e.preventDefault();
    const fields = step === 3 ? (pay === "card" ? STEP_FIELDS.card : []) : STEP_FIELDS[step];
    const errs = validate(fields, data);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) return document.getElementById(`ck-${first}`)?.focus();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await placeOrder();
  }

  async function placeOrder() {
    setSending(true);
    try {
      // Os dados do cartão NÃO vão para o nosso servidor: na integração real eles
      // são enviados direto ao gateway de pagamento, que devolve um token.
      const { card, cardName, validade, cvv, ...customer } = data;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(({ id, color, size, qty }) => ({ id, color, size, qty })),
          coupon, ship, pay, installments: pay === "card" ? installments : 1, customer,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível concluir o pedido");
      setOrder(json.order);
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast(err.message);
    } finally {
      setSending(false);
    }
  }

  if (order) return <Confirmation order={order} toast={toast} />;

  if (!ready) return <div className="checkout-page" />;

  if (cart.length === 0) {
    return (
      <div className="checkout-page checkout-empty">
        <h1>Sua sacola está vazia</h1>
        <p className="muted">Escolha seus produtos e volte aqui para finalizar.</p>
        <Link href="/#loja" className="btn btn-primary">Ver produtos</Link>
      </div>
    );
  }

  const fieldProps = { data, errors, onChange };

  return (
    <div className="checkout-page">
      <div className="ck-main">
        <ol className="stepper">
          {STEPS.map((s, i) => (
            <li key={s} className={i + 1 === step ? "current" : i + 1 < step ? "done" : ""}>
              <span>{i + 1 < step ? "✓" : i + 1}</span>{s}
            </li>
          ))}
        </ol>

        <form ref={formRef} onSubmit={submit} noValidate>
          {step === 1 && (
            <>
              <h3>Seus dados</h3>
              <div className="form-grid">
                <Field name="nome" label="Nome completo" full autoComplete="name" {...fieldProps} />
                <Field name="email" label="E-mail" type="email" autoComplete="email" placeholder="voce@email.com" {...fieldProps} />
                <Field name="tel" label="Celular" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" {...fieldProps} />
                <Field name="cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" {...fieldProps} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Entrega</h3>
              <div className="form-grid">
                <Field name="cep" label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" {...fieldProps} />
                <p className="cep-hint">{cepHint}</p>
                <Field name="rua" label="Rua / Avenida" full autoComplete="address-line1" {...fieldProps} />
                <Field name="numero" label="Número" inputMode="numeric" {...fieldProps} />
                <Field name="compl" label="Complemento (opcional)" autoComplete="address-line2" {...fieldProps} />
                <Field name="bairro" label="Bairro" {...fieldProps} />
                <Field name="cidade" label="Cidade" autoComplete="address-level2" {...fieldProps} />
                <Field name="uf" label="UF" autoComplete="address-level1" placeholder="SP" {...fieldProps} />
              </div>
              <p className="opt-label">Forma de envio</p>
              <div className="radio-list">
                {Object.entries(SHIP_OPTIONS).map(([k, o]) => {
                  const price = o.price(t.base);
                  return (
                    <label key={k} className={`radio ${ship === k ? "active" : ""}`}>
                      <input type="radio" name="ship" value={k} checked={ship === k} onChange={() => setShip(k)} />
                      <span><b>{o.label}</b><small>{o.eta}</small></span>
                      <strong>{price ? brl(price) : "Grátis"}</strong>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>Pagamento</h3>
              <div className="pay-tabs" role="tablist">
                {Object.entries(PAY_OPTIONS).map(([k, o]) => (
                  <button key={k} type="button" role="tab" aria-selected={pay === k}
                    className={`pay-tab ${pay === k ? "active" : ""}`} onClick={() => setPay(k)}>
                    <b>{o.label}</b><small>{o.hint}</small>
                  </button>
                ))}
              </div>
              {pay === "pix" && (
                <p className="pay-note">Você ganha <b>5% de desconto</b> nos produtos. O código Pix aparece depois de confirmar o pedido e vale por 30 minutos.</p>
              )}
              {pay === "boleto" && (
                <p className="pay-note">O boleto vence em 3 dias úteis. O pedido é separado após a compensação (até 2 dias úteis).</p>
              )}
              {pay === "card" && (
                <div className="form-grid">
                  <Field name="card" label="Número do cartão" full inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" {...fieldProps} />
                  <Field name="cardName" label="Nome impresso no cartão" full autoComplete="cc-name" {...fieldProps} />
                  <Field name="validade" label="Validade" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" {...fieldProps} />
                  <Field name="cvv" label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="123" {...fieldProps} />
                  <label className="field full">
                    <span>Parcelas</span>
                    <select id="ck-installments" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                      {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}x de {brl(t.total / n)} sem juros</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              <p className="demo-note">Ambiente de demonstração: nenhum pagamento real é processado.</p>
            </>
          )}

          {step === 3 && (
            <p className="consent">
              Ao confirmar, você concorda com os <Link href="/termos" target="_blank">Termos de uso</Link> e
              a <Link href="/privacidade" target="_blank">Política de privacidade</Link>, e conhece as regras de{" "}
              <Link href="/trocas-e-devolucoes" target="_blank">trocas e devoluções</Link>.
            </p>
          )}
          <div className="ck-actions">
            {step > 1 ? <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Voltar</button> : <Link href="/" className="btn btn-ghost">Continuar comprando</Link>}
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {step < 3 ? "Continuar" : sending ? "Enviando…" : "Confirmar pedido"}
            </button>
          </div>
        </form>
      </div>

      <aside className="ck-summary">
        <h4>Resumo do pedido</h4>
        <ul className="sum-items">
          {t.lines.map((l) => (
            <li key={l.key}>
              <div className={`thumb sm ${l.product.images?.length ? "has-photo" : ""}`} data-bg={l.color}><ProductImage product={l.product} color={l.color} /><span className="q">{l.qty}</span></div>
              <div><p>{l.product.name}</p><small>{COLORS[l.color].name} · {l.size}</small></div>
              <strong>{brl(l.product.price * l.qty)}</strong>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{brl(t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="disc"><dt>Cupom {coupon}</dt><dd>− {brl(t.discount)}</dd></div>}
          {t.pix > 0 && <div className="disc"><dt>Desconto Pix</dt><dd>− {brl(t.pix)}</dd></div>}
          <div><dt>Frete{step >= 2 ? ` · ${SHIP_OPTIONS[ship].label}` : ""}</dt><dd>{t.shipping ? brl(t.shipping) : "Grátis"}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{brl(t.total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}

function Confirmation({ order, toast }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.pixCode);
      toast("Código Pix copiado");
    } catch {
      getSelection().selectAllChildren(document.getElementById("pixCode"));
      toast("Selecionado: use Ctrl+C para copiar");
    }
  };
  return (
    <div className="checkout-page">
      <div className="ck-done">
        <div className="done-badge">✓</div>
        <p className="eyebrow">Pedido {order.number}</p>
        <h2>Valeu, {order.firstName}!</h2>
        <p className="muted">
          Guarde o número do pedido para acompanhar ou pedir uma troca. Total: <b>{brl(order.total)}</b> · {order.shipLabel} ({order.eta}).
        </p>
        {order.pay === "pix" && (
          <div className="pix-box">
            <p>Pix copia e cola (demonstração)</p>
            <code id="pixCode">{order.pixCode}</code>
            <button className="btn btn-primary small" onClick={copy}>Copiar código</button>
          </div>
        )}
        {order.pay === "boleto" && <p className="pay-note">Pagamento por boleto, com vencimento em 3 dias úteis.</p>}
        {order.pay === "card" && <p className="pay-note">Pagamento aprovado em {order.installments}x de {brl(order.total / order.installments)}.</p>}
        <Link href="/" className="btn btn-ghost">Continuar comprando</Link>
      </div>
    </div>
  );
}
