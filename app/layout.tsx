import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://finalscalc.com'),
  title: {
    default: 'Final Exam Grade Calculator – What Do I Need on My Final? | FinalsCalc',
    template: '%s | FinalsCalc',
  },
  description: 'Free final exam grade calculator. Enter your current grade, target grade, and exam weight to instantly find out what score you need on your final. Works for multiple classes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinalsCalc',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'FinalsCalc',
    title: 'Final Exam Grade Calculator – What Do I Need on My Final? | FinalsCalc',
    description: 'Free final exam grade calculator. Enter your current grade, target grade, and exam weight to instantly find out what score you need on your final. Works for multiple classes.',
    url: 'https://finalscalc.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Final Exam Grade Calculator – What Do I Need on My Final? | FinalsCalc',
    description: 'Free final exam grade calculator. Enter your current grade, target grade, and exam weight to instantly find out what score you need on your final. Works for multiple classes.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Script src="https://jacobbarkin.com/embed/credit.js" strategy="afterInteractive" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
