"use client";

import { useActionState, useState } from "react";
import { submitReview } from "./actions";

const LABELS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

export default function ReviewForm({ productId, orderNumber, existing }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const saved = state?.ok ? state : existing;
  const [editing, setEditing] = useState(!saved);
  const [rating, setRating] = useState(saved?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (saved && !editing && !(state && !state.ok)) {
    return (
      <div className="my-review">
        <span className="stars" aria-label={`Sua nota: ${saved.rating} de 5`}>{"★".repeat(saved.rating)}{"☆".repeat(5 - saved.rating)}</span>
        {state?.ok && <span className="muted small"> Obrigado pela avaliação!</span>}
        {saved.comment && <p className="small">&ldquo;{saved.comment}&rdquo;</p>}
        <button type="button" className="link-btn" onClick={() => setEditing(true)}>Editar avaliação</button>
      </div>
    );
  }

  return (
    <form action={(fd) => { setEditing(false); return action(fd); }} className="review-form">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset className="star-input" onMouseLeave={() => setHover(0)}>
        <legend className="small">Sua nota{rating ? `: ${LABELS[rating]}` : ""}</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={(hover || rating) >= n ? "on" : ""}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            aria-pressed={rating === n}
          >★</button>
        ))}
      </fieldset>
      <label className="field">
        <span className="small">Comentário (opcional)</span>
        <textarea id={`review-${orderNumber}-${productId}`} name="comment" rows={2} maxLength={600}
          defaultValue={saved?.comment ?? ""} placeholder="Tamanho, tecido, conforto no treino…" />
      </label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary small" disabled={pending || !rating}>{pending ? "Enviando…" : "Enviar avaliação"}</button>
    </form>
  );
}
