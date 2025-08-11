import type { Metadata } from 'next'
import {
  Playfair_Display,
  Crimson_Pro,
  Source_Code_Pro
} from 'next/font/google'
import './globals.css'
import FooterBar from '@/components/FooterBar'
import SidebarAutoHide from './SidebarAutoHide'
import Link from 'next/link'

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
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://cassowary-world.com'),
  alternates: { canonical: '/' },
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

// Document categories
const documentCategories = [
  {
    id: 'technical',
    name: 'Technical Documents',
    description:
      'Explore detailed documents, cultural descriptions, and scholarly guides that illuminate how this cassowary civilization functions, thrives, and shapes its remarkable world.',
    href: '/technical-docs',
    icon: '🔧'
  },
  {
    id: 'speeches',
    name: 'Speeches',
    description:
      'Listen to the voices of cassowary leaders, orators, and visionaries as they address their society with wisdom, inspiration, and calls to action.',
    href: '/speeches',
    icon: '🎤'
  },
  {
    id: 'concept-art',
    name: 'Concept Art',
    description:
      'Explore visual designs, sketches, and artistic renderings that bring the cassowary world to life through the eyes of its creators.',
    href: '/concept-art',
    icon: '🎨'
  }
]

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${crimson.variable} ${mono.variable} antialiased flex min-h-screen flex-col`}
        style={{ backgroundColor: 'var(--background)' }}
      >
        {/* Header */}
        <header
          className="border-b border-solid"
          style={{ borderColor: 'var(--color-leaf-shadow)' }}
        >
          <div className="p-6">
            <Link href="/" className="inline-block">
              <h1
                className="text-4xl font-bold hover:opacity-80 transition-opacity duration-200"
                style={{ color: 'var(--color-cassowary)' }}
              >
                Cassowary World
              </h1>
            </Link>
          </div>
        </header>

        <SidebarAutoHide />

        {/* Main with native <details> sidebar */}
        <div className="flex flex-1 flex-row">
          <details
            id="sidebar"
            className="group w-[100px] md:w-[300px] border-r border-solid shadow-lg lg:relative h-screen overflow-y-auto"
            open
          >
            <summary className="hidden" />
            {/* Mobile: text-only nav */}
            <nav className="lg:hidden flex flex-col gap-2 p-2">
              {documentCategories.map(c => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="rounded-lg transition-all duration-200 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5 bg-[var(--color-cassowary)] hover:bg-[var(--color-bird-blue)] w-20 h-12 text-sm flex justify-center items-center font-medium text-center leading-tight"
                  title={c.name}
                >
                  {c.name}
                </Link>
              ))}
            </nav>

            {/* Desktop: full cards */}
            <div className="hidden lg:block p-6">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--color-cassowary)' }}
              >
                Document Categories
              </h2>
              <nav className="space-y-3">
                {documentCategories.map(c => (
                  <Link
                    key={c.id}
                    href={c.href}
                    className="category-card block"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{c.name}</h3>
                        <p className="text-sm opacity-90">{c.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </details>

          {/* Content: padding collapses when sidebar is closed */}
          <main
            id="main"
            className="flex-1 lg:ml-0 transition-all duration-200 pl-4 group-[details:not([open])]:pl-0"
          >
            {children}
          </main>
        </div>

        <FooterBar />
      </body>
    </html>
  )
}
