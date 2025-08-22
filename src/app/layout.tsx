import type { Metadata } from 'next'
import {
  Playfair_Display,
  Crimson_Pro,
  Source_Code_Pro
} from 'next/font/google'
import './globals.css'
import FooterBar from '@/components/FooterBar'
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

// Ad component with Google AdSense standard sizes
function AdBanner({ size, position }: { size: string; position: string }) {
  const adStyles = {
    '728x90':
      'w-full h-[90px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '300x250':
      'w-[300px] h-[250px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '300x600':
      'w-[300px] h-[600px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '160x600':
      'w-[160px] h-[600px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '320x50':
      'w-full h-[50px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '970x90':
      'w-full h-[90px] bg-gray-100 border border-gray-300 flex items-center justify-center',
    '970x250':
      'w-full h-[250px] bg-gray-100 border border-gray-300 flex items-center justify-center'
  }

  const demoContent = {
    '728x90': 'Google AdSense - 728x90 Leaderboard',
    '300x250': 'Google AdSense - 300x250 Medium Rectangle',
    '300x600': 'Google AdSense - 300x600 Half Page',
    '160x600': 'Google AdSense - 160x600 Wide Skyscraper',
    '320x50': 'Google AdSense - 320x50 Mobile Banner',
    '970x90': 'Google AdSense - 970x90 Large Leaderboard',
    '970x250': 'Google AdSense - 970x250 Billboard'
  }

  return (
    <div
      className={`${adStyles[size as keyof typeof adStyles]} text-gray-600 text-sm font-medium`}
    >
      {demoContent[size as keyof typeof demoContent]}
    </div>
  )
}

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
          <div className="p-6 text-center">
            <Link href="/" className="inline-block">
              <h1
                className="text-4xl font-bold hover:opacity-80 transition-opacity duration-200 mb-6"
                style={{ color: 'var(--color-cassowary)' }}
              >
                The Cassowary Review
              </h1>
            </Link>

            {/* Navigation Menu */}
            <nav className="flex flex-wrap justify-center gap-4">
              {documentCategories.map(c => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5 bg-[var(--color-cassowary)] hover:bg-[var(--color-bird-blue)] font-medium"
                >
                  <span className="text-lg">{c.icon}</span>
                  <span>{c.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Top Banner Ad */}
          <div className="w-full bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto py-2">
              <AdBanner size="728x90" position="top" />
            </div>
          </div>
        </header>

        {/* Main Layout with Sidebars */}
        <div className="flex flex-1 max-w-7xl mx-auto">
          {/* Left Sidebar Ad */}
          <div className="hidden lg:block w-[160px] flex-shrink-0 p-4">
            <div className="sticky top-4">
              <AdBanner size="160x600" position="left" />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 px-6">{children}</main>

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block w-[300px] flex-shrink-0 p-4">
            <div className="sticky top-4">
              <AdBanner size="300x600" position="right" />
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <div className="w-full bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto py-4">
            <AdBanner size="970x250" position="bottom" />
          </div>
        </div>

        <FooterBar />
      </body>
    </html>
  )
}
