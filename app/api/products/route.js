// GET /api/products: catálogo em JSON (base para o painel de administração e apps).
import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

export function GET() {
  return NextResponse.json({ products: PRODUCTS });
}
