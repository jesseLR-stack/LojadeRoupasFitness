"use client";

import { useRef } from "react";

const ROWS = [
  ["PP", "78–82", "60–64", "86–90", "34–36"],
  ["P", "83–87", "65–69", "91–95", "38"],
  ["M", "88–94", "70–76", "96–102", "40–42"],
  ["G", "95–101", "77–83", "103–109", "44"],
  ["GG", "102–108", "84–90", "110–116", "46"],
  ["XG", "109–116", "91–98", "117–124", "48"],
];

// Botão/link que abre o guia de tamanhos em uma janela.
export default function SizeGuide({ className = "size-guide", children = "Guia de tamanhos" }) {
  const ref = useRef(null);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current.showModal()}>{children}</button>
      <dialog
        ref={ref}
        className="size-modal"
        aria-labelledby="sizeTitle"
        onClick={(e) => e.target === e.currentTarget && ref.current.close()}
      >
        <button className="icon-btn modal-close" onClick={() => ref.current.close()} aria-label="Fechar">✕</button>
        <h2 id="sizeTitle">Guia de tamanhos</h2>
        <p className="muted">
          Medidas do corpo em centímetros. Entre dois tamanhos, escolha o maior para mais conforto ou o menor para mais compressão.
        </p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tamanho</th><th>Busto</th><th>Cintura</th><th>Quadril</th><th>Numeração</th></tr></thead>
            <tbody>{ROWS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="muted small">
          Como medir: busto na parte mais cheia, cintura na parte mais fina e quadril na parte mais larga, com a fita sem apertar.
        </p>
      </dialog>
    </>
  );
}
