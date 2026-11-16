"use client";

import { useRef, useState } from "react";
import { addProductImage, makeMainImage, removeProductImage } from "../actions";

const MAX_SIDE = 1600; // pixels no lado maior
const QUALITY = 0.85;

// Reduz a foto no navegador antes de enviar (fotos de celular costumam ter 3–10 MB).
async function shrink(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/webp", QUALITY));
    if (!blob) throw new Error("sem webp");
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file; // navegador sem suporte: envia o original (o servidor confere tipo e tamanho)
  }
}

export default function ImageManager({ productId, initialImages, max }) {
  const [images, setImages] = useState(initialImages);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function run(action, fields) {
    const fd = new FormData();
    fd.set("id", productId);
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    const res = await action(fd);
    if (res?.error) throw new Error(res.error);
    if (res?.images) setImages(res.images);
  }

  async function onFiles(files) {
    setError("");
    const list = [...files].slice(0, max - images.length);
    if (!list.length) return setError(`Cada produto pode ter até ${max} fotos.`);
    setBusy(true);
    try {
      for (const [i, f] of list.entries()) {
        setStatus(`Enviando foto ${i + 1} de ${list.length}…`);
        await run(addProductImage, { file: await shrink(f) });
      }
      setStatus("Fotos salvas. A loja já foi atualizada.");
    } catch (e) {
      setError(e.message);
      setStatus("");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function act(action, url, done) {
    setError("");
    setBusy(true);
    try {
      await run(action, { url });
      setStatus(done);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="image-manager">
      <legend>Fotos</legend>
      <p className="hint">A primeira foto é a principal (aparece no cartão da loja). Até {max} fotos por produto.</p>

      {images.length > 0 && (
        <ul className="image-grid">
          {images.map((url, i) => (
            <li key={url} className={i === 0 ? "main" : ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} />
              {i === 0 ? (
                <span className="badge">Principal</span>
              ) : (
                <button type="button" disabled={busy} onClick={() => act(makeMainImage, url, "Foto principal alterada.")}>
                  Tornar principal
                </button>
              )}
              <button type="button" className="remove-img" disabled={busy} aria-label={`Remover foto ${i + 1}`}
                onClick={() => act(removeProductImage, url, "Foto removida.")}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {images.length < max && (
        <label className={`upload-drop ${busy ? "busy" : ""}`}>
          <input
            ref={inputRef}
            id="imageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            multiple
            disabled={busy}
            onChange={(e) => onFiles(e.target.files)}
          />
          <b>{busy ? "Enviando…" : "+ Adicionar fotos"}</b>
          <span className="hint">Toque para escolher da galeria ou tirar uma foto. JPG, PNG ou WebP.</span>
        </label>
      )}
      {status && <p className="admin-notice small" role="status">{status}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </fieldset>
  );
}
