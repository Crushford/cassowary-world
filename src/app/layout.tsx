import type { Metadata } from 'next'
import {
  Playfair_Display,
  Crimson_Pro,
  Source_Code_Pro
} from 'next/font/google'
import './globals.css'
import FooterBar from '@/components/FooterBar'

const playfair = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '700']
})

const crimson = Crimson_Pro({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '600']
})

const mono = Source_Code_Pro({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400']
})

export const metadata: Metadata = {
  title: 'Cassowary World',
  description:
    'Explore the fascinating world of cassowaries through technical documentation and research',
  keywords: [
    'cassowary',
    'wildlife',
    'birds',
    'nature',
    'documentation',
    'research'
  ],
  authors: [{ name: 'Cassowary World Team' }],
  creator: 'Cassowary World',
  publisher: 'Cassowary World',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL('https://cassowary-world.com'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Cassowary World',
    description:
      'Explore the fascinating world of cassowaries through technical documentation and research',
    url: 'https://cassowary-world.com',
    siteName: 'Cassowary World',
    images: [
      {
        url: '/favicon.png',
        width: 32,
        height: 32,
        alt: 'Cassowary World Logo'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${crimson.variable} ${mono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">{children}</div>
        <FooterBar />
      </body>
    </html>
  )
}
