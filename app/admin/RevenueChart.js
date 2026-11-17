"use client";

import { useState } from "react";
import { niceMax } from "@/lib/analytics";
import { brl } from "@/lib/pricing";

const W = 720;
const H = 240;
const M = { top: 22, right: 8, bottom: 30, left: 64 };
const BAR_MAX = 24;
const compact = (v) => (v >= 1000 ? `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : `R$ ${v.toLocaleString("pt-BR")}`);

// Coluna com topo arredondado (4px) e base reta no eixo.
function columnPath(x, y, w, h) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export default function RevenueChart({ daily }) {
  const [active, setActive] = useState(null);
  const max = niceMax(Math.max(...daily.map((d) => d.total)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  const slot = innerW / daily.length;
  const barW = Math.min(BAR_MAX, slot * 0.6);
  const y = (v) => M.top + innerH - (v / max) * innerH;
  const peak = daily.reduce((best, d, i) => (d.total > (daily[best]?.total ?? 0) ? i : best), -1);
  const a = active != null ? daily[active] : null;

  return (
    <div className="chart">
      <div className="chart-plot" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Faturamento por dia nos últimos 14 dias">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="grid" />
              <text x={M.left - 8} y={y(t)} className="axis" textAnchor="end" dominantBaseline="middle">{compact(t)}</text>
            </g>
          ))}
          {daily.map((d, i) => {
            const cx = M.left + slot * i + slot / 2;
            const h = Math.max(0, y(0) - y(d.total));
            return (
              <g key={d.key}>
                {h > 0 && (
                  <path d={columnPath(cx - barW / 2, y(d.total), barW, h)} className={`bar ${active === i ? "on" : ""}`} />
                )}
                {i === peak && d.total > 0 && active !== i && (
                  <text x={cx} y={y(d.total) - 6} className="value" textAnchor="middle">{compact(d.total)}</text>
                )}
                <text x={cx} y={H - 10} className="axis" textAnchor="middle">{d.label}</text>
                {/* Área de passar o mouse: a coluna inteira, maior que a barra */}
                <rect
                  x={M.left + slot * i}
                  y={M.top}
                  width={slot}
                  height={innerH}
                  className="hit"
                  tabIndex={0}
                  aria-label={`${d.weekday} ${d.label}: ${brl(d.total)}, ${d.orders} pedido(s)`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            );
          })}
        </svg>
        {a && (
          <div
            className="chart-tip"
            style={{ left: `${((M.left + slot * active + slot / 2) / W) * 100}%`, top: `${(y(a.total) / H) * 100}%` }}
            role="status"
          >
            <b>{a.weekday}, {a.label}</b>
            <span>{brl(a.total)}</span>
            <small>{a.orders} {a.orders === 1 ? "pedido" : "pedidos"}</small>
          </div>
        )}
      </div>
      <details className="chart-table">
        <summary>Ver em tabela</summary>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Dia</th><th className="num">Pedidos</th><th className="num">Faturamento</th></tr></thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.key}><td>{d.weekday}, {d.label}</td><td className="num">{d.orders}</td><td className="num">{brl(d.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
