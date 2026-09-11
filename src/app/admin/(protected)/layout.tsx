import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/admin/actions";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produtos", href: "/admin/produtos" },
  { label: "Categorias", href: "/admin/categorias" },
  { label: "Banners", href: "/admin/banners" },
  { label: "Pedidos", href: "/admin/pedidos" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <aside className="flex w-56 shrink-0 flex-col border-r border-brand-secondary/60 bg-brand-white p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-spiral.png" alt="Caramellada Kids" style={{ height: 32, width: 32, alignSelf: "flex-start" }} />
        <p className="mt-2 text-xs text-brand-text/50">Painel Admin</p>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-secondary/30 hover:text-brand-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={logout} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-text/60 transition-colors hover:bg-brand-secondary/30 hover:text-brand-primary"
          >
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
