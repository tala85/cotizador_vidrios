import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTO ES LA MAGIA DEL DISEÑO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidriería Misiones - Sistema de Gestión",
  description: "Cotizador de vidrios y presupuestos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
