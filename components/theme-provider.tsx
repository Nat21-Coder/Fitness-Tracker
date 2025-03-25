"use client"

import { ThemeProvider as NextThemeProvider } from "next-themes"
import type { ReactNode } from "react"
interface ProvidersProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ProvidersProps) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  )
}

