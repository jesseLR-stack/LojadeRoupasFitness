import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductView from "@/components/ProductView";
import { PRODUCTS, categoryLabel, getProductBySlug, relatedProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

// Gera uma página estática para cada produto no build.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: { title: p.name, description: p.description, type: "website" },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // Dados estruturados: ajudam o Google a mostrar preço e avaliação nos resultados.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: `NF-${product.id}`,
    brand: { "@type": "Brand", name: "NewFitness" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produto/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="breadcrumb" aria-label="Você está em">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href="/#loja">{categoryLabel(product.category)}</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <ProductView product={product} />

      <section className="related-section">
        <h2 className="section-title">Combina com</h2>
        <div className="product-grid">
          {relatedProducts(product).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
