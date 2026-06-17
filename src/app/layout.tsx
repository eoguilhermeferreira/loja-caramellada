import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Caramelada Kids | Moda Infantil com Qualidade e Carinho",
  description:
    "Roupas confortáveis e estilosas para bebês e crianças. Conheça a coleção da Caramelada Kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        {children}
      </body>
    </html>
  );
}
