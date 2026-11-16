import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "../ProductForm";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await db.getProduct({ id: Number(id) });
  if (!product) notFound();
  return (
    <>
      <div className="admin-head"><h1>Editar produto</h1></div>
      <ProductForm product={product} />
    </>
  );
}
