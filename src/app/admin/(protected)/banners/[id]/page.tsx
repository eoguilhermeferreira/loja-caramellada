import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BannerForm } from "@/app/admin/(protected)/banners/BannerForm";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: banner } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!banner) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Editar Banner</h1>
      <div className="mt-6">
        <BannerForm banner={banner} />
      </div>
    </div>
  );
}
