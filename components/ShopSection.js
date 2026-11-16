"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COLLECTIONS } from "@/lib/products";
import ProductCard from "./ProductCard";
import { useStore } from "./StoreProvider";
import { SearchIcon } from "./icons";

const SORTERS = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  new: (a, b) => Number(b.isNew) - Number(a.isNew),
};

export default function ShopSection() {
  const params = useSearchParams();
  const { favs, catalog } = useStore();
  const searchRef = useRef(null);
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [collection, setCollection] = useState("all");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);

  // Links como /?genero=feminino#loja ajustam os filtros.
  useEffect(() => {
    setGender(params.get("genero") ?? "all");
    setCollection(params.get("modalidade") ?? "all");
    setOnlyFavs(params.get("favoritos") === "1");
    if (params.get("busca")) setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 400);
  }, [params]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = catalog.filter((p) =>
      (category === "all" || p.category === category) &&
      (gender === "all" || p.gender === gender || p.gender === "unissex") &&
      (collection === "all" || p.collections.includes(collection)) &&
      (!onlyFavs || favs.includes(p.id)) &&
      (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q))
    );
    return SORTERS[sort] ? [...filtered].sort(SORTERS[sort]) : filtered;
  }, [catalog, category, gender, collection, sort, query, onlyFavs, favs]);

  return (
    <section className="shop" id="loja">
      <div className="shop-head">
        <h2 className="section-title">Loja</h2>
        <p className="result-info">{list.length} {list.length === 1 ? "produto" : "produtos"}</p>
      </div>

      <div className="filters">
        <div className="search-box">
          <SearchIcon />
          <input
            ref={searchRef}
            id="searchInput"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar legging, top, shorts…"
            aria-label="Buscar produtos"
          />
        </div>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={`chip ${category === c.id ? "active" : ""}`} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
          <button className={`chip chip-fav ${onlyFavs ? "active" : ""}`} onClick={() => setOnlyFavs(!onlyFavs)}>
            ♥ Favoritos ({favs.length})
          </button>
        </div>
        <div className="filter-row">
          <select id="genderSelect" value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Gênero">
            <option value="all">Todos os gêneros</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="unissex">Unissex</option>
          </select>
          <select id="collectionSelect" value={collection} onChange={(e) => setCollection(e.target.value)} aria-label="Modalidade">
            <option value="all">Todas as modalidades</option>
            {Object.entries(COLLECTIONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select id="sortSelect" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
            <option value="featured">Destaques</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="rating">Mais bem avaliados</option>
            <option value="new">Lançamentos</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {list.length === 0 && (
        <p className="empty">
          {onlyFavs && favs.length === 0
            ? "Você ainda não tem favoritos. Toque no ♥ de um produto para salvar."
            : "Nenhum produto encontrado. Tente outro filtro."}
        </p>
      )}
    </section>
  );
}
