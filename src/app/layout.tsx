import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma de Tráfego IA — Meta Ads & Delivery",
  description: "Automação e gestão inteligente de anúncios Meta Ads integrada ao Prefiro Delivery para restaurantes e dark kitchens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
