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

// Document categories - easily extensible for future document types
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
  // Future categories can be added here:
  // {
  //   id: 'research',
  //   name: 'Research Papers',
  //   description: 'Academic research and scientific papers',
  //   href: '/research',
  //   icon: '📚'
  // },
  // {
  //   id: 'user-guides',
  //   name: 'User Guides',
  //   description: 'User manuals and tutorials',
  //   href: '/user-guides',
  //   icon: '📖'
  // }
]

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${crimson.variable} ${mono.variable} antialiased flex flex-col`}
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

        {/* Main content area with sidebar */}
        <div className="flex flex-1 flex-row">
          {/* Left Sidebar */}
          <aside className="sidebar lg:w-80 shadow-lg border-r border-solid">
            <div className="p-2 lg:p-6">
              {/* Desktop heading - hidden on mobile */}
              <h2
                className="hidden lg:block text-2xl font-bold mb-6"
                style={{ color: 'var(--color-cassowary)' }}
              >
                Document Categories
              </h2>

              {/* Mobile navigation - emojis only */}
              <nav className="lg:hidden flex flex-col space-y-2">
                {documentCategories.map(category => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="category-card px-1 py-1 text-xl flex justify-center"
                    title={category.name}
                  >
                    {category.icon}
                  </Link>
                ))}
              </nav>

              {/* Desktop navigation - full cards */}
              <nav className="hidden lg:block space-y-3">
                {documentCategories.map(category => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="category-card"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm opacity-90">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>

        <FooterBar />
      </body>
    </html>
  )
}
