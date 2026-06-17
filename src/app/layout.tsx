import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsappButton } from "@/components/WhatsappButton";
import { CartProvider } from "@/components/CartProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "Caramelada Kids | Moda Infantil com Qualidade e Carinho";
const description =
  "Roupas confortáveis e estilosas para bebês e crianças. Conheça a coleção da Caramelada Kids.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Caramelada Kids",
  },
  description,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Caramelada Kids",
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#D81B60",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <WhatsappButton />
        </CartProvider>
      </body>
    </html>
  );
}
