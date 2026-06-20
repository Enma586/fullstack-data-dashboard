/**
 * RootLayout — Layout raíz de la aplicación.
 * Define metadatos globales, carga globals.css e inyecta Providers.
 */
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
