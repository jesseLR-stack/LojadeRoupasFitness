import Link from "next/link";

export default function NotFound() {
  return (
    <div className="checkout-page checkout-empty">
      <h1>Página não encontrada</h1>
      <p className="muted">O produto pode ter saído de linha ou o endereço está errado.</p>
      <Link href="/#loja" className="btn btn-primary">Ver produtos</Link>
    </div>
  );
}
