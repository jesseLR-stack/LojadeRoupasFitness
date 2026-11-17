"use client";

import { useState } from "react";

// Pede confirmação na própria linha antes de remover.
export default function DeleteReviewButton({ id, action }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <button type="button" className="btn btn-ghost small danger" onClick={() => setConfirm(true)}>Remover</button>;
  return (
    <form action={action} className="row">
      <input type="hidden" name="id" value={id} />
      <button type="button" className="btn btn-ghost small" onClick={() => setConfirm(false)}>Manter</button>
      <button className="btn small btn-danger">Remover</button>
    </form>
  );
}
