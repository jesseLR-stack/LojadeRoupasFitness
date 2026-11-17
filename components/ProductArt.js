import { colorOf } from "@/lib/colors";
import { SHAPES } from "@/lib/products";

// Silhueta da peça na cor escolhida (aparece quando o produto ainda não tem foto).
export default function ProductArt({ product, color }) {
  const c = colorOf(color || product.colors[0]);
  return (
    <svg className="art" viewBox="0 0 200 240" style={{ "--c": c.hex }} data-light={c.light} aria-hidden="true">
      <g className="garment" dangerouslySetInnerHTML={{ __html: SHAPES[product.category] }} />
    </svg>
  );
}
