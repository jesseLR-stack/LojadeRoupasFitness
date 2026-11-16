import { PRODUCTS } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...PRODUCTS.map((p) => ({ url: `${SITE_URL}/produto/${p.slug}`, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
