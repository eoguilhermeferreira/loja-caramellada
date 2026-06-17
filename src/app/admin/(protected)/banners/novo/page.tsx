import { BannerForm } from "@/app/admin/(protected)/banners/BannerForm";

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Novo Banner</h1>
      <div className="mt-6">
        <BannerForm />
      </div>
    </div>
  );
}
