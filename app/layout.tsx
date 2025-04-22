import type React from "react"
import Link from "next/link"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Niko Weaver - Engineering Portfolio",
  description: "Mechanical Engineering Student at Duke University",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <nav className="flex items-center space-x-4 lg:space-x-6">
                <Link href="/#home" className="text-sm ml-5 font-medium transition-colors hover:text-primary">
                  Home
                </Link>
                <Link href="/#projects" className="text-sm font-medium transition-colors hover:text-primary">
                  Projects
                </Link>
                <Link href="/#resume" className="text-sm font-medium transition-colors hover:text-primary">
                  Resume
                </Link>
                <Link href="/blog" className="text-sm font-medium transition-colors hover:text-primary">
                  Blog
                </Link>
              </nav>
              <div className="ml-auto flex items-center space-x-4">
                <Suspense fallback={<div className="h-10 w-10"></div>}>
                  <ThemeToggle />
                </Suspense>
              </div>
            </div>
          </header>
          <main>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </main>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
