import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/api/", "/admin", "/conta"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
