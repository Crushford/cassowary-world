import Link from 'next/link'

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

export default function HomePage() {
  return (
    <div className="flex " style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="p-6">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: 'var(--color-cassowary)' }}
          >
            Document Categories
          </h2>
          <nav className="space-y-3">
            {documentCategories.map(category => (
              <Link
                key={category.id}
                href={category.href}
                className="category-card"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Future categories placeholder */}
          {documentCategories.length < 4 && (
            <div className="mt-8 placeholder-box">
              <p className="text-sm text-center">
                More document categories coming soon...
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <h1
            className="text-5xl font-bold mb-6"
            style={{ color: 'var(--color-cassowary)' }}
          >
            Cassowary World
          </h1>
          <p
            className="text-xl mb-8 leading-relaxed"
            style={{ color: 'var(--foreground)' }}
          >
            Welcome to Cassowary World: a comprehensive resource documenting the
            society, knowledge, and history of an alternate Earth dominated by
            intelligent, sentient cassowaries. Explore technical documentation,
            detailed research, and user guides to deepen your understanding of
            their unique civilization.
          </p>

          <div className="card">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: 'var(--color-cassowary)' }}
            >
              Getting Started
            </h2>
            <p className="mb-6" style={{ color: 'var(--foreground)' }}>
              Select a document category from the sidebar to begin exploring our
              resources. Each category contains specialized content tailored to
              different needs and interests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/technical-docs"
                className="info-box block hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold mb-2">Technical Documents</h3>
                <p className="text-sm">
                  Explore detailed documents, cultural descriptions, and
                  scholarly guides that illuminate how this cassowary
                  civilization functions, thrives, and shapes its remarkable
                  world.
                </p>
              </Link>

              <Link
                href="/speeches"
                className="info-box block hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold mb-2">Speeches</h3>
                <p className="text-sm">
                  Listen to the voices of cassowary leaders, orators, and
                  visionaries as they address their society with wisdom,
                  inspiration, and calls to action.
                </p>
              </Link>

              <Link
                href="/concept-art"
                className="info-box block hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold mb-2">Concept Art</h3>
                <p className="text-sm">
                  Explore visual designs, sketches, and artistic renderings that
                  bring the cassowary world to life through the eyes of its
                  creators.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
