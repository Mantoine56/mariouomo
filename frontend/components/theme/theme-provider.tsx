/**
 * ThemeProvider Component
 * 
 * Manages the application's theme state (light/dark)
 * Uses next-themes for SSR support and system preference detection
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Theme provider wrapper around next-themes
 * This provider should be used at the root layout level
 */
export function ThemeProvider({ 
  children, 
  ...props 
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
} 