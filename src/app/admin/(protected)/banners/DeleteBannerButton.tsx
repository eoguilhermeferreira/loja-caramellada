"use client";

import { useRouter } from "next/navigation";
import { deleteBanner } from "@/app/admin/actions";

export function DeleteBannerButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    await deleteBanner(id);
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
