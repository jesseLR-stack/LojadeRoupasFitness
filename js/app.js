// ===== Estado =====
const FREE_SHIPPING = 299;
const SHIPPING_COST = 24.9;
const COUPONS = { NEW10: 0.1, TREINO15: 0.15 };

const state = {
  category: "all",
  gender: "all",
  collection: "all",
  sort: "featured",
  query: "",
  cart: load("newfitness-cart", []),
  coupon: load("newfitness-coupon", null),
  favs: load("newfitness-favs", []),
  onlyFavs: false,
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save() {
  try {
    localStorage.setItem("newfitness-cart", JSON.stringify(state.cart));
    localStorage.setItem("newfitness-coupon", JSON.stringify(state.coupon));
    localStorage.setItem("newfitness-favs", JSON.stringify(state.favs));
  } catch { /* armazenamento indisponível: segue só em memória */ }
}

const $ = (s) => document.querySelector(s);
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// ===== Catálogo =====
function renderChips() {
  $("#categoryChips").innerHTML = CATEGORIES.map(
    (c) => `<button class="chip ${state.category === c.id ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`
  ).join("") +
    `<button class="chip chip-fav ${state.onlyFavs ? "active" : ""}" data-favs>♥ Favoritos (${state.favs.length})</button>`;
}

const HEART = `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>`;

function toggleFav(id) {
  const on = !state.favs.includes(id);
  state.favs = on ? [...state.favs, id] : state.favs.filter((f) => f !== id);
  save();
  renderFavCount();
  renderChips();
  renderProducts();
  toast(on ? "Salvo nos favoritos ♥" : "Removido dos favoritos");
}

function renderFavCount() {
  $("#favCount").textContent = state.favs.length;
  $("#favCount").classList.toggle("show", state.favs.length > 0);
}

function relatedProducts(p) {
  return PRODUCTS
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, score: (x.category === p.category ? 2 : 0) + x.collections.filter((c) => p.collections.includes(c)).length }))
    .sort((a, b) => b.score - a.score || b.x.rating - a.x.rating)
    .slice(0, 3)
    .map((r) => r.x);
}

function filteredProducts() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter((p) =>
    (state.category === "all" || p.category === state.category) &&
    (state.gender === "all" || p.gender === state.gender || p.gender === "unissex") &&
    (state.collection === "all" || p.collections.includes(state.collection)) &&
    (!state.onlyFavs || state.favs.includes(p.id)) &&
    (!q ||`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q))
  );
  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    new: (a, b) => Number(b.isNew) - Number(a.isNew),
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
  return list;
}

function productCard(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `
  <article class="card" data-id="${p.id}" tabindex="0">
    <div class="card-media" data-bg="${p.colors[0]}">
      <div class="tags">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        ${discount ? `<span class="tag tag-off">-${discount}%</span>` : ""}
      </div>
      <button class="fav-btn ${state.favs.includes(p.id) ? "on" : ""}" data-fav="${p.id}"
        aria-label="${state.favs.includes(p.id) ? "Remover dos favoritos" : "Salvar nos favoritos"}" aria-pressed="${state.favs.includes(p.id)}">${HEART}</button>
      ${productArt(p)}
      <button class="quick-add" data-quick="${p.id}">+ Adicionar rápido</button>
    </div>
    <div class="card-body">
      <div class="swatches">${p.colors.map((c) => `<span style="background:${COLORS[c].hex}" title="${COLORS[c].name}"></span>`).join("")}</div>
      <h3>${p.name}</h3>
      <p class="rating"><span>${stars(p.rating)}</span> ${p.rating} (${p.reviews})</p>
      <p class="price">${p.oldPrice ? `<s>${brl(p.oldPrice)}</s>` : ""}<strong>${brl(p.price)}</strong></p>
      <p class="installments">ou 6x de ${brl(p.price / 6)}</p>
    </div>
  </article>`;
}

function renderProducts() {
  const list = filteredProducts();
  $("#productGrid").innerHTML = list.map(productCard).join("");
  $("#emptyState").hidden = list.length > 0;
  $("#emptyState").textContent = state.onlyFavs && !state.favs.length
    ? "Você ainda não tem favoritos. Toque no ♥ de um produto para salvar."
    : "Nenhum produto encontrado. Tente outro filtro.";
  $("#resultInfo").textContent = `${list.length} ${list.length === 1 ? "produto" : "produtos"}`;
}

// ===== Modal de produto =====
let modalSel = null;

function openProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  modalSel = { id, color: p.colors[0], size: null };
  renderModal();
  $("#productModal").showModal();
}

function renderModal() {
  const p = PRODUCTS.find((x) => x.id === modalSel.id);
  $("#productModal").innerHTML = `
    <button class="icon-btn modal-close" data-close aria-label="Fechar">✕</button>
    <div class="modal-media" data-bg="${modalSel.color}">${productArt(p, modalSel.color)}</div>
    <div class="modal-info">
      <p class="eyebrow">${CATEGORIES.find((c) => c.id === p.category).label} · ${p.gender}</p>
      <h2 id="modalTitle">${p.name}</h2>
      <p class="rating"><span>${stars(p.rating)}</span> ${p.rating} · ${p.reviews} avaliações</p>
      <p class="price big">${p.oldPrice ? `<s>${brl(p.oldPrice)}</s>` : ""}<strong>${brl(p.price)}</strong></p>
      <p class="installments">6x de ${brl(p.price / 6)} sem juros · ${brl(p.price * 0.95)} no Pix</p>
      <p class="desc">${p.description}</p>

      <p class="opt-label">Cor: <b>${COLORS[modalSel.color].name}</b></p>
      <div class="color-opts">${p.colors.map((c) =>
        `<button class="color-opt ${c === modalSel.color ? "active" : ""}" data-color="${c}" style="--sw:${COLORS[c].hex}" aria-label="${COLORS[c].name}"></button>`).join("")}</div>

      <p class="opt-label">Tamanho: <b>${modalSel.size || "selecione"}</b> <a href="#" class="size-guide" data-guide>Guia de tamanhos</a></p>
      <div class="size-opts">${p.sizes.map((s) =>
        `<button class="size-opt ${s === modalSel.size ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}</div>

      <button class="btn btn-primary full" data-add>Adicionar à sacola</button>
      <ul class="perks">
        <li>✓ Tecido Dry‑Fit antissuor</li>
        <li>✓ Troca grátis em 30 dias</li>
        <li>✓ Envio em até 24h úteis</li>
      </ul>
      <button class="btn btn-ghost small fav-inline ${state.favs.includes(p.id) ? "on" : ""}" data-fav-modal>
        ${HEART} ${state.favs.includes(p.id) ? "Nos seus favoritos" : "Salvar nos favoritos"}</button>

      <p class="opt-label">Combina com</p>
      <div class="related">${relatedProducts(p).map((r) => `
        <button class="rel" data-related="${r.id}">
          <div class="thumb" data-bg="${r.colors[0]}">${productArt(r)}</div>
          <span>${r.name}</span><b>${brl(r.price)}</b>
        </button>`).join("")}
      </div>
    </div>`;
}

$("#productModal").addEventListener("click", (e) => {
  const t = e.target;
  if (t === e.currentTarget || t.closest("[data-close]")) return $("#productModal").close();
  if (t.dataset.color) { modalSel.color = t.dataset.color; renderModal(); }
  if (t.dataset.size) { modalSel.size = t.dataset.size; renderModal(); }
  if (t.closest("[data-guide]")) { e.preventDefault(); $("#sizeModal").showModal(); }
  if (t.closest("[data-fav-modal]")) { toggleFav(modalSel.id); renderModal(); }
  const rel = t.closest("[data-related]");
  if (rel) {
    const p = PRODUCTS.find((x) => x.id === Number(rel.dataset.related));
    modalSel = { id: p.id, color: p.colors[0], size: null };
    renderModal();
    $("#productModal").scrollTop = 0;
  }
  if (t.closest("[data-add]")) {
    if (!modalSel.size) {
      $(".size-opts").classList.add("shake");
      setTimeout(() => $(".size-opts")?.classList.remove("shake"), 500);
      return toast("Escolha um tamanho 😉");
    }
    addToCart(modalSel.id, modalSel.color, modalSel.size);
    $("#productModal").close();
    openCart();
  }
});

// ===== Sacola =====
function addToCart(id, color, size, qty = 1) {
  const key = `${id}-${color}-${size}`;
  const item = state.cart.find((i) => i.key === key);
  if (item) item.qty += qty;
  else state.cart.push({ key, id, color, size, qty });
  save();
  renderCart();
  bump();
  toast("Adicionado à sacola ✓");
}

function totals() {
  const subtotal = state.cart.reduce((s, i) => s + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
  const discount = state.coupon ? subtotal * COUPONS[state.coupon] : 0;
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function renderCart() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartCount").classList.toggle("show", count > 0);

  $("#cartItems").innerHTML = state.cart.length
    ? state.cart.map((i) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return `<li class="cart-item">
          <div class="thumb" data-bg="${i.color}">${productArt(p, i.color)}</div>
          <div class="ci-info">
            <p class="ci-name">${p.name}</p>
            <p class="ci-meta">${COLORS[i.color].name} · ${i.size}</p>
            <div class="qty">
              <button data-dec="${i.key}" aria-label="Diminuir">−</button>
              <span>${i.qty}</span>
              <button data-inc="${i.key}" aria-label="Aumentar">+</button>
            </div>
          </div>
          <div class="ci-right">
            <strong>${brl(p.price * i.qty)}</strong>
            <button class="remove" data-remove="${i.key}">Remover</button>
          </div>
        </li>`;
      }).join("")
    : `<li class="cart-empty"><p>Sua sacola está vazia.</p><a href="#loja" class="btn btn-ghost small" data-close-cart>Começar a comprar</a></li>`;

  const t = totals();
  const missing = FREE_SHIPPING - (t.subtotal - t.discount);
  $("#shipText").innerHTML = t.subtotal === 0
    ? `Frete grátis acima de <b>${brl(FREE_SHIPPING)}</b>`
    : missing > 0 ? `Faltam <b>${brl(missing)}</b> para o frete grátis 🚚` : `Você ganhou <b>frete grátis</b>! 🎉`;
  $("#shipFill").style.width = `${Math.min(100, ((t.subtotal - t.discount) / FREE_SHIPPING) * 100)}%`;

  $("#totals").innerHTML = `
    <div><dt>Subtotal</dt><dd>${brl(t.subtotal)}</dd></div>
    ${t.discount ? `<div class="disc"><dt>Cupom ${state.coupon}</dt><dd>− ${brl(t.discount)}</dd></div>` : ""}
    <div><dt>Frete</dt><dd>${t.shipping ? brl(t.shipping) : "Grátis"}</dd></div>
    <div class="grand"><dt>Total</dt><dd>${brl(t.total)}</dd></div>`;
  $("#checkoutBtn").disabled = state.cart.length === 0;
}

$("#cartItems").addEventListener("click", (e) => {
  const { inc, dec, remove } = e.target.dataset;
  const key = inc || dec || remove;
  if (e.target.closest("[data-close-cart]")) return closeCart();
  if (!key) return;
  const item = state.cart.find((i) => i.key === key);
  if (inc) item.qty++;
  if (dec) item.qty--;
  if (remove || item.qty <= 0) state.cart = state.cart.filter((i) => i.key !== key);
  save();
  renderCart();
});

$("#applyCoupon").addEventListener("click", () => {
  const code = $("#couponInput").value.trim().toUpperCase();
  if (COUPONS[code]) {
    state.coupon = code;
    toast(`Cupom ${code} aplicado: ${COUPONS[code] * 100}% OFF`);
  } else {
    toast("Cupom inválido");
  }
  save();
  renderCart();
});

$("#checkoutBtn").addEventListener("click", () => openCheckout());

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("show");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("show");
}
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

function bump() {
  const b = $("#openCart");
  b.classList.remove("bump");
  void b.offsetWidth;
  b.classList.add("bump");
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ===== Eventos da loja =====
function showFavorites(on) {
  state.onlyFavs = on;
  renderChips();
  renderProducts();
}

$("#openFavs").addEventListener("click", () => {
  showFavorites(true);
  $("#loja").scrollIntoView({ behavior: "smooth" });
});

$("#sizeModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget || e.target.closest("[data-size-close]")) $("#sizeModal").close();
});
document.querySelectorAll("[data-open-guide]").forEach((a) =>
  a.addEventListener("click", (e) => { e.preventDefault(); $("#sizeModal").showModal(); })
);

$("#categoryChips").addEventListener("click", (e) => {
  if (e.target.closest("[data-favs]")) return showFavorites(!state.onlyFavs);
  if (!e.target.dataset.cat) return;
  state.category = e.target.dataset.cat;
  renderChips();
  renderProducts();
});

$("#productGrid").addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) return toggleFav(Number(fav.dataset.fav));
  const quick = e.target.closest("[data-quick]");
  if (quick) {
    const p = PRODUCTS.find((x) => x.id === Number(quick.dataset.quick));
    const size = p.sizes.includes("M") ? "M" : p.sizes[0];
    return addToCart(p.id, p.colors[0], size);
  }
  const card = e.target.closest(".card");
  if (card) openProduct(Number(card.dataset.id));
});
$("#productGrid").addEventListener("keydown", (e) => {
  const card = e.target.closest(".card");
  if (card && e.key === "Enter" && e.target === card) openProduct(Number(card.dataset.id));
});

$("#searchInput").addEventListener("input", (e) => { state.query = e.target.value; renderProducts(); });
$("#genderSelect").addEventListener("change", (e) => { state.gender = e.target.value; renderProducts(); });
$("#collectionSelect").addEventListener("change", (e) => { state.collection = e.target.value; renderProducts(); });
$("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });

$("#openSearch").addEventListener("click", () => {
  $("#loja").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#searchInput").focus({ preventScroll: true }), 400);
});

document.querySelectorAll("[data-collection]").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.collection = btn.dataset.collection;
    $("#collectionSelect").value = state.collection;
    renderProducts();
    $("#loja").scrollIntoView({ behavior: "smooth" });
  })
);

document.querySelectorAll("[data-nav-gender], [data-nav-cat]").forEach((a) =>
  a.addEventListener("click", () => {
    state.gender = a.dataset.navGender || "all";
    $("#genderSelect").value = state.gender;
    renderProducts();
  })
);

$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("Bem-vindo(a) ao time! Use o cupom NEW10 🎁");
});

// Header muda ao rolar
window.addEventListener("scroll", () => $(".header").classList.toggle("scrolled", scrollY > 20), { passive: true });

// Peças flutuantes do hero
$("#heroCard1").innerHTML = productArt(PRODUCTS[0], "vinho");
$("#heroCard1").dataset.bg = "vinho";
$("#heroCard2").innerHTML = productArt(PRODUCTS[1], "lima");
$("#heroCard2").dataset.bg = "lima";

// ===== Início =====
renderChips();
renderProducts();
renderCart();
renderFavCount();
