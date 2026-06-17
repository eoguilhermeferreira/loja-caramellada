"use client";

import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    await deleteProduct(id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-medium text-red-600 hover:text-red-700"
    >
      Excluir
    </button>
  );
}
