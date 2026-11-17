// Dados da loja exigidos por lei em lojas online (Decreto 7.962/2013, art. 2º):
// nome empresarial, CPF ou CNPJ, endereço e um meio de contato.
// Cadastre na Vercel (Settings → Environment Variables) e faça um novo deploy.
// Use só em componentes do servidor.

const env = (k) => process.env[k]?.trim() || "";

export const STORE = {
  name: "NewFitness",
  legalName: env("STORE_LEGAL_NAME"), // ex.: "Maria Souza 12345678000199" (MEI) ou "NewFitness Comércio Ltda."
  document: env("STORE_DOCUMENT"), // CNPJ (recomendado) ou CPF
  address: env("STORE_ADDRESS"), // ex.: "Rua X, 100, Sala 2, Centro, São Paulo/SP, CEP 01000-000"
  email: env("STORE_EMAIL"),
  whatsapp: env("STORE_WHATSAPP").replace(/\D/g, ""), // só números, com DDD: 11987654321
  hours: env("STORE_HOURS") || "segunda a sexta, das 9h às 18h",
};

export const POLICY_UPDATED = "17 de novembro de 2026";

// Campos obrigatórios que ainda faltam (o painel avisa).
export function missingStoreInfo() {
  const labels = {
    legalName: "STORE_LEGAL_NAME (nome ou razão social)",
    document: "STORE_DOCUMENT (CPF ou CNPJ)",
    address: "STORE_ADDRESS (endereço)",
    email: "STORE_EMAIL (e-mail de atendimento)",
  };
  return Object.entries(labels).filter(([k]) => !STORE[k]).map(([, label]) => label);
}

export function formatWhatsapp(n) {
  const d = n.replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return n;
}

export const whatsappLink = (n) => `https://wa.me/${n.startsWith("55") ? n : "55" + n}`;
