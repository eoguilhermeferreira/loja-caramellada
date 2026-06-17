import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteBannerButton } from "./DeleteBannerButton";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Banners</h1>
        <Link
          href="/admin/banners/novo"
          className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
        >
          Novo Banner
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {(banners ?? []).map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between rounded-xl bg-brand-white p-4 shadow-sm"
          >
            <div>
              <p className="font-medium text-brand-text">{banner.title}</p>
              <p className="text-sm text-brand-text/60">{banner.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  banner.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {banner.is_active ? "Ativo" : "Inativo"}
              </span>
              <Link
                href={`/admin/banners/${banner.id}`}
                className="text-sm font-medium text-brand-primary hover:underline"
              >
                Editar
              </Link>
              <DeleteBannerButton id={banner.id} />
            </div>
          </div>
        ))}
        {(banners ?? []).length === 0 && (
          <p className="text-sm text-brand-text/50">Nenhum banner cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
