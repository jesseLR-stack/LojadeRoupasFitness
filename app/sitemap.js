import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap() {
  const products = await db.listProducts();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({ url: `${SITE_URL}/produto/${p.slug}`, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
