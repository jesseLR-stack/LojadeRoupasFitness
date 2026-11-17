import { stars } from "./icons";

// Mostra a nota só quando o produto tem avaliações reais.
export default function Rating({ product, long = false }) {
  if (!product.reviews) return null;
  const n = product.reviews;
  return (
    <p className="rating" title={`${product.rating.toFixed(1)} de 5, ${n} ${n === 1 ? "avaliação" : "avaliações"}`}>
      <span>{stars(product.rating)}</span> {product.rating.toFixed(1)}
      {long ? ` · ${n} ${n === 1 ? "avaliação" : "avaliações"}` : ` (${n})`}
    </p>
  );
}
