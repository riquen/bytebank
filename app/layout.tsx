import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bytebank",
  description: "Aplicação de gerenciamento financeiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased`}
      >
        <div>
          <Header />
          {/* <main className="container mx-auto px-4 py-6 flex-grow"> */}
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
