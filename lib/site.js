// Endereço público do site, usado no sitemap, no robots.txt e nos links para o Google.
// 1. NEXT_PUBLIC_SITE_URL: defina quando tiver domínio próprio (ex.: https://www.newfitness.com.br)
// 2. VERCEL_PROJECT_PRODUCTION_URL: preenchida automaticamente pela Vercel (ex.: newfitness.vercel.app)
// 3. localhost: quando roda no seu computador
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
).replace(/\/$/, "");
