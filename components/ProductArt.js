import { COLORS, LIGHT_COLORS, SHAPES } from "@/lib/products";

// Silhueta da peça na cor escolhida. Troque por <Image> quando houver fotos reais.
export default function ProductArt({ product, color }) {
  const key = color || product.colors[0];
  return (
    <svg
      className="art"
      viewBox="0 0 200 240"
      style={{ "--c": COLORS[key].hex }}
      data-light={LIGHT_COLORS.includes(key)}
      aria-hidden="true"
    >
      <g className="garment" dangerouslySetInnerHTML={{ __html: SHAPES[product.category] }} />
    </svg>
  );
}
