// File: app/layout.tsx

import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import './globals.css'
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CookiesProvider } from "next-client-cookies/server";

export const metadata: Metadata = {
  title: 'Mario Uomo',
  description: 'Premium Men\'s Fashion E-commerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <CookiesProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </CookiesProvider>
      </body>
    </html>
  )
}
