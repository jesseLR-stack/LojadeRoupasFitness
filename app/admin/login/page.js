import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }) {
  const { voltar } = await searchParams;
  return (
    <div className="admin-login">
      <h1>Entrar no painel</h1>
      <p className="muted">Área restrita para gerenciar produtos e pedidos da loja.</p>
      <LoginForm voltar={voltar ?? "/admin"} />
    </div>
  );
}
