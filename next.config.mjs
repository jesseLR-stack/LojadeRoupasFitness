/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Fotos enviadas pelo painel (já reduzidas no navegador). A Vercel aceita até 4,5 MB por envio.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
