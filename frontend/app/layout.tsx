// File: app/layout.tsx

import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import './globals.css'

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
