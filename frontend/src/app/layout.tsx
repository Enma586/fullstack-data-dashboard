import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olist Dashboard",
  description: "Monitoreo de desempeño de ventas — Olist E-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
