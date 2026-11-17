"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const StoreContext = createContext(null);
const KEYS = { cart: "newfitness-cart", favs: "newfitness-favs", coupon: "newfitness-coupon" };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: segue em memória */ }
}

export function StoreProvider({ children, catalog = [] }) {
  const [cart, setCart] = useState([]);
  const [favs, setFavs] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [bump, setBump] = useState(0);
  const toastTimer = useRef();

  useEffect(() => {
    setCart(read(KEYS.cart, []));
    setFavs(read(KEYS.favs, []));
    const saved = read(KEYS.coupon, null);
    setCoupon(saved?.code && saved?.percent ? saved : null); // formato antigo (texto) é descartado
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    write(KEYS.cart, cart);
    write(KEYS.favs, favs);
    write(KEYS.coupon, coupon);
  }, [cart, favs, coupon, ready]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2600);
  }, []);

  // Quantas unidades deste produto já estão na sacola (somando cores e tamanhos).
  const inCart = (c, id) => c.filter((i) => i.id === id).reduce((s, i) => s + i.qty, 0);
  const stockOf = useCallback((id) => catalog.find((p) => p.id === id)?.stock ?? 0, [catalog]);

  const addToCart = useCallback((id, color, size, qty = 1) => {
    if (inCart(cart, id) + qty > stockOf(id)) {
      toast(stockOf(id) === 0 ? "Produto esgotado" : `Só temos ${stockOf(id)} unidade(s) desse produto`);
      return false;
    }
    const key = `${id}-${color}-${size}`;
    setCart((c) => c.some((i) => i.key === key)
      ? c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      : [...c, { key, id, color, size, qty }]);
    setBump((b) => b + 1);
    toast("Adicionado à sacola ✓");
    return true;
  }, [cart, stockOf, toast]);

  const changeQty = useCallback((key, delta) => {
    const item = cart.find((i) => i.key === key);
    if (item && delta > 0 && inCart(cart, item.id) + delta > stockOf(item.id)) {
      toast(`Só temos ${stockOf(item.id)} unidade(s) desse produto`);
      return;
    }
    setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  }, [cart, stockOf, toast]);

  const removeItem = useCallback((key) => setCart((c) => c.filter((i) => i.key !== key)), []);

  const clearCart = useCallback(() => { setCart([]); setCoupon(null); }, []);

  const toggleFav = useCallback((id) => {
    setFavs((f) => {
      const on = !f.includes(id);
      toast(on ? "Salvo nos favoritos ♥" : "Removido dos favoritos");
      return on ? [...f, id] : f.filter((x) => x !== id);
    });
  }, [toast]);

  // O cupom é conferido no servidor (ativo, validade, limite de usos).
  const applyCoupon = useCallback(async (code) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || "Cupom inválido"); return false; }
      setCoupon(data.coupon);
      toast(`Cupom ${data.coupon.code} aplicado: ${data.coupon.percent}% OFF`);
      return true;
    } catch {
      toast("Não foi possível conferir o cupom. Tente de novo.");
      return false;
    }
  }, [toast]);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const value = {
    ready, catalog, cart, favs, coupon, cartOpen, bump,
    addToCart, changeQty, removeItem, clearCart, toggleFav, applyCoupon, removeCoupon, setCoupon, toast,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className={`toast ${toastMsg ? "show" : ""}`} role="status">{toastMsg}</div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
