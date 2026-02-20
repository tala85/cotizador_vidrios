import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTO ES LA MAGIA DEL DISEÑO
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cotizador Profesional de Vidrios",
  description: "Sistema avanzado para la gestión de presupuestos y costos de vidriería. Generación de PDFs profesional.",
  keywords: ["vidriería", "cotizador", "presupuestos", "vidrios", "gestión", "argentina"],
  authors: [{ name: "Vidriería Misiones" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
