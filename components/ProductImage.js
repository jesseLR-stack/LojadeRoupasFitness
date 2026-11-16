import ProductArt from "./ProductArt";

// Foto principal do produto; sem foto, mostra o desenho da peça na cor escolhida.
export default function ProductImage({ product, color, index = 0, priority = false }) {
  const src = product.images?.[index];
  if (!src) return <ProductArt product={product} color={color} />;
  return (
    // Fotos já chegam reduzidas pelo painel; <img> simples evita depender do otimizador da Vercel.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="photo"
      src={src}
      alt={product.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
