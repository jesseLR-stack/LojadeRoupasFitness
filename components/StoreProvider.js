"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { COUPONS } from "@/lib/pricing";

const StoreContext = createContext(null);
const KEYS = { cart: "newfitness-cart", favs: "newfitness-favs", coupon: "newfitness-coupon" };

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: segue em memória */ }
}

export function StoreProvider({ children }) {
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
    setCoupon(read(KEYS.coupon, null));
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

  const addToCart = useCallback((id, color, size, qty = 1) => {
    const key = `${id}-${color}-${size}`;
    setCart((c) => c.some((i) => i.key === key)
      ? c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      : [...c, { key, id, color, size, qty }]);
    setBump((b) => b + 1);
    toast("Adicionado à sacola ✓");
  }, [toast]);

  const changeQty = useCallback((key, delta) => {
    setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  }, []);

  const removeItem = useCallback((key) => setCart((c) => c.filter((i) => i.key !== key)), []);

  const clearCart = useCallback(() => { setCart([]); setCoupon(null); }, []);

  const toggleFav = useCallback((id) => {
    setFavs((f) => {
      const on = !f.includes(id);
      toast(on ? "Salvo nos favoritos ♥" : "Removido dos favoritos");
      return on ? [...f, id] : f.filter((x) => x !== id);
    });
  }, [toast]);

  const applyCoupon = useCallback((code) => {
    const c = code.trim().toUpperCase();
    if (!COUPONS[c]) { toast("Cupom inválido"); return false; }
    setCoupon(c);
    toast(`Cupom ${c} aplicado: ${COUPONS[c] * 100}% OFF`);
    return true;
  }, [toast]);

  const value = {
    ready, cart, favs, coupon, cartOpen, bump,
    addToCart, changeQty, removeItem, clearCart, toggleFav, applyCoupon, toast,
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
