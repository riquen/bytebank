import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bytebank',
  description: 'Aplicação de gerenciamento financeiro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex flex-col min-h-dvh">
          <Header />
          <main className="flex flex-col flex-1 container mx-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
