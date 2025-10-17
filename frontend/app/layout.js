import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import NextTopLoader from 'nextjs-toploader'

export const metadata = {
  title: 'compuCobano - Tu conexión global en oficina, escuela y tecnología',
  description: 'Conectamos el mundo con productos de oficina, escolares y tecnológicos. Todo lo que necesitas para tu productividad global.',
  keywords: 'compucobano, oficina, escolar, cómputo, papelería, tecnología, laptop, impresoras, cuadernos, Costa Rica',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg'
  },
  openGraph: {
    title: 'compuCobano - Tu tienda de oficina, escuela y tecnología',
    description: 'Todo para tu productividad: artículos de oficina, escolares y tecnológicos.',
    type: 'website',
    locale: 'es_CR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'compuCobano - Tu tienda de oficina, escuela y tecnología',
    description: 'Todo para tu productividad: artículos de oficina, escolares y tecnológicos.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
}

export default function RootLayout({ children }) {
  return (
  <html lang="es-CR" className="scroll-smooth">
      <body className={cn(
        "min-h-screen bg-gray-100 font-sans antialiased",
        "selection:bg-primary/20 selection:text-primary-foreground"
      )}>
    <link rel="preconnect" href="https://wjgitkxfzdmrblqzwryf.supabase.co" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://wa.me" />
        <div className="relative flex min-h-screen flex-col">
          {/* Loading bar visible en transiciones de ruta y fetches client-side */}
          <NextTopLoader color="#2563eb" height={3} showSpinner={false} zIndex={90} />
          <div className="flex-1">
            {children}
          </div>
          <Toaster />
        </div>
      </body>
    </html>
  )
}