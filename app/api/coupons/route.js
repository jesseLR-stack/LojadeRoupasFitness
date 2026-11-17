// POST /api/coupons { code }: confere se o cupom existe e pode ser usado agora.
import { NextResponse } from "next/server";
import { couponProblem, normalizeCode } from "@/lib/coupons";
import { db } from "@/lib/db";

export async function POST(request) {
  const { code } = await request.json().catch(() => ({}));
  let c;
  try {
    c = await db.getCoupon(normalizeCode(code));
  } catch {
    return NextResponse.json({ error: "Cupons indisponíveis no momento. Tente mais tarde." }, { status: 503 });
  }
  const problem = couponProblem(c);
  if (problem) return NextResponse.json({ error: problem }, { status: 404 });
  return NextResponse.json({ coupon: { code: c.code, percent: c.percent } });
}
