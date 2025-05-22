import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Final Exam Grade Calculator',
  description: 'Calculate what you need on your finals to achieve your target grades',
  keywords: ['grade calculator', 'final exam', 'GPA calculator', 'student tools', 'academic planning'],
  authors: [{ name: 'Jacob Barkin' }],
  creator: 'Jacob Barkin',
  openGraph: {
    title: 'Final Exam Grade Calculator',
    description: 'Calculate what you need on your finals to achieve your target grades',
    url: 'https://final-exam-grade-calculator.pages.dev',
    siteName: 'Final Exam Grade Calculator',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
