import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bytebank',
  description: 'Aplicação de gerenciamento financeiro',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          closeOnClick
          draggable
          style={{ top: '6rem', zIndex: 10 }}
        />
      </body>
    </html>
  )
}
