// Máscaras e validações de formulário (usadas no checkout e na API de pedidos).

export const MASKS = {
  cpf: (v) => v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  tel: (v) => v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2"),
  cep: (v) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  card: (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  validade: (v) => v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2"),
  cvv: (v) => v.replace(/\D/g, "").slice(0, 4),
  uf: (v) => v.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase(),
};

export function validCPF(value) {
  const d = String(value).replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(d[len])) return false;
  }
  return true;
}

// Cada regra devolve true ou a mensagem de erro.
export const RULES = {
  nome: (v) => v.trim().split(/\s+/).length >= 2 || "Informe nome e sobrenome",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "E-mail inválido",
  tel: (v) => v.replace(/\D/g, "").length >= 10 || "Telefone com DDD",
  cpf: (v) => validCPF(v) || "CPF inválido",
  cep: (v) => v.replace(/\D/g, "").length === 8 || "CEP com 8 dígitos",
  rua: (v) => v.trim().length > 2 || "Informe a rua",
  numero: (v) => v.trim().length > 0 || "Obrigatório",
  bairro: (v) => v.trim().length > 1 || "Informe o bairro",
  cidade: (v) => v.trim().length > 1 || "Informe a cidade",
  uf: (v) => v.length === 2 || "UF",
  card: (v) => v.replace(/\D/g, "").length >= 13 || "Número do cartão inválido",
  cardName: (v) => v.trim().length > 3 || "Nome como está no cartão",
  validade: (v, now = new Date()) => {
    const [m, y] = v.split("/").map(Number);
    if (!m || m > 12 || y === undefined || v.length !== 5) return "MM/AA";
    return new Date(2000 + y, m) > now || "Cartão vencido"; // vale até o fim do mês
  },
  cvv: (v) => v.length >= 3 || "CVV",
};

export const STEP_FIELDS = {
  1: ["nome", "email", "tel", "cpf"],
  2: ["cep", "rua", "numero", "bairro", "cidade", "uf"],
  card: ["card", "cardName", "validade", "cvv"],
};

export function validate(fields, data) {
  const errors = {};
  for (const f of fields) {
    const res = RULES[f](String(data[f] ?? ""));
    if (res !== true) errors[f] = res;
  }
  return errors;
}
