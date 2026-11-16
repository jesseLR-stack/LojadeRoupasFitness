"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import ProductArt from "@/components/ProductArt";
import ImageManager from "./ImageManager";
import { CATEGORIES, COLLECTIONS, COLORS, GENDERS, SIZES, TAGS, slugify } from "@/lib/products";
import { deleteProduct, saveProduct } from "../actions";

function Err({ msg }) {
  return msg ? <small className="err">{msg}</small> : null;
}

export default function ProductForm({ product, maxImages = 6 }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const v = state?.values ?? product ?? {};
  const e = state?.errors ?? {};
  const list = (k) => [].concat(v[k] ?? []);
  const money = (x) => (typeof x === "number" ? x.toFixed(2).replace(".", ",") : x ?? "");
  // Cores já escolhidas primeiro (na ordem do produto), para não trocar a cor principal ao salvar.
  const chosen = list("colors").filter((c) => COLORS[c]);
  const colorOrder = [...chosen, ...Object.keys(COLORS).filter((c) => !chosen.includes(c))].map((id) => [id, COLORS[id]]);

  // Pré-visualização ao vivo da peça
  const [preview, setPreview] = useState({
    category: v.category ?? "legging",
    color: list("colors")[0] ?? "preto",
    name: v.name ?? "",
    slug: v.slug ?? "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="product-editor">
      <form
        action={action}
        className="admin-form"
        onChange={(ev) => {
          const f = ev.currentTarget;
          const val = (n) => f.elements.namedItem(n)?.value ?? "";
          setPreview({
            category: val("category"),
            color: f.querySelector('input[name="colors"]:checked')?.value ?? "preto",
            name: val("name"),
            slug: val("slug"),
          });
        }}
      >
        {product?.id && <input type="hidden" name="id" value={product.id} />}
        {e.form && <p className="form-error" role="alert">{e.form}</p>}

        <fieldset>
          <legend>Informações</legend>
          <label className="field full">
            <span>Nome do produto</span>
            <input id="name" name="name" defaultValue={v.name} required />
            <Err msg={e.name} />
          </label>
          <label className="field full">
            <span>Endereço da página (opcional)</span>
            <input id="slug" name="slug" defaultValue={v.slug} placeholder={slugify(preview.name) || "gerado-pelo-nome"} />
            <small className="hint">loja/produto/{slugify(preview.slug || preview.name) || "…"}</small>
            <Err msg={e.slug} />
          </label>
          <label className="field full">
            <span>Descrição</span>
            <textarea id="description" name="description" rows={4} defaultValue={v.description} />
            <Err msg={e.description} />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Categoria</span>
              <select id="category" name="category" defaultValue={v.category ?? "legging"}>
                {CATEGORIES.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <Err msg={e.category} />
            </label>
            <label className="field">
              <span>Gênero</span>
              <select id="gender" name="gender" defaultValue={v.gender ?? "feminino"}>
                {Object.entries(GENDERS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <Err msg={e.gender} />
            </label>
          </div>
          <div className="field full">
            <span>Modalidades</span>
            <div className="check-row">
              {Object.entries(COLLECTIONS).map(([id, label]) => (
                <label key={id} className="check">
                  <input type="checkbox" name="collections" value={id} defaultChecked={list("collections").includes(id)} /> {label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Preço e estoque</legend>
          <div className="form-grid three">
            <label className="field">
              <span>Preço (R$)</span>
              <input id="price" name="price" inputMode="decimal" defaultValue={money(v.price)} placeholder="189,90" />
              <Err msg={e.price} />
            </label>
            <label className="field">
              <span>Preço &quot;de&quot; (opcional)</span>
              <input id="oldPrice" name="oldPrice" inputMode="decimal" defaultValue={money(v.oldPrice)} placeholder="229,90" />
              <Err msg={e.oldPrice} />
            </label>
            <label className="field">
              <span>Estoque (unidades)</span>
              <input id="stock" name="stock" inputMode="numeric" defaultValue={v.stock ?? 0} />
              <Err msg={e.stock} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Cores e tamanhos</legend>
          <div className="field full">
            <span>Cores disponíveis</span>
            <small className="hint">A primeira cor marcada é a principal: é ela que aparece no cartão da loja.</small>
            <div className="check-row">
              {colorOrder.map(([id, c]) => (
                <label key={id} className="check swatch-check">
                  <input type="checkbox" name="colors" value={id} defaultChecked={list("colors").includes(id)} />
                  <i style={{ background: c.hex }} /> {c.name}
                </label>
              ))}
            </div>
            <Err msg={e.colors} />
          </div>
          <div className="field full">
            <span>Tamanhos disponíveis</span>
            <div className="check-row">
              {SIZES.map((s) => (
                <label key={s} className="check">
                  <input type="checkbox" name="sizes" value={s} defaultChecked={list("sizes").includes(s)} /> {s}
                </label>
              ))}
            </div>
            <Err msg={e.sizes} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Vitrine</legend>
          <div className="form-grid">
            <label className="field">
              <span>Etiqueta no cartão</span>
              <select id="tag" name="tag" defaultValue={v.tag ?? ""}>
                {TAGS.map((t) => <option key={t} value={t}>{t || "Nenhuma"}</option>)}
              </select>
            </label>
          </div>
          <label className="check">
            <input type="checkbox" name="isNew" defaultChecked={!!v.isNew} /> Lançamento (aparece primeiro em &quot;Lançamentos&quot;)
          </label>
          <label className="check">
            <input type="checkbox" name="active" defaultChecked={v.active ?? true} /> Visível na loja
          </label>
        </fieldset>

        <div className="ck-actions">
          <Link href="/admin/produtos" className="btn btn-ghost">Cancelar</Link>
          <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar produto"}</button>
        </div>
      </form>

      <aside className="editor-side">
        {product?.id ? (
          <ImageManager productId={product.id} initialImages={product.images ?? []} max={maxImages} />
        ) : (
          <>
            <div className="editor-preview" data-bg={preview.color}>
              <ProductArt product={{ category: preview.category, colors: [preview.color] }} color={preview.color} />
            </div>
            <p className="muted small">Salve o produto para poder adicionar fotos. Enquanto não houver fotos, a loja mostra este desenho.</p>
          </>
        )}

        {product?.id && (
          <div className="danger-zone">
            {!confirmDelete ? (
              <button type="button" className="btn btn-ghost small danger" onClick={() => setConfirmDelete(true)}>Excluir produto</button>
            ) : (
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <p className="small">Excluir <b>{product.name}</b>? Isso não pode ser desfeito. Se quiser só tirar da loja, desmarque &quot;Visível na loja&quot;.</p>
                <div className="row">
                  <button type="button" className="btn btn-ghost small" onClick={() => setConfirmDelete(false)}>Manter</button>
                  <button type="submit" className="btn small btn-danger">Sim, excluir</button>
                </div>
              </form>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
