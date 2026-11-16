import Link from "next/link";
import SizeGuide from "./SizeGuide";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link href="/" className="logo">New<span>Fitness</span></Link>
        <p>Moda fitness de alta performance.</p>
      </div>
      <div>
        <h4>Loja</h4>
        <Link href="/?genero=feminino#loja">Feminino</Link>
        <Link href="/?genero=masculino#loja">Masculino</Link>
        <Link href="/#colecoes">Coleções</Link>
      </div>
      <div>
        <h4>Ajuda</h4>
        <Link href="#">Trocas e devoluções</Link>
        <SizeGuide className="footer-link" />
        <Link href="#">Fale conosco</Link>
      </div>
      <p className="copy">© 2026 NewFitness. Todos os direitos reservados.</p>
    </footer>
  );
}
