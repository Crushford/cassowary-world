import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Cassowary World</h1>
      <p className="text-lg mb-8">
        Welcome to the Cassowary World documentation and research portal.
      </p>
      <div className="space-y-4">
        <Link
          href="/technical-docs"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Technical Documents
        </Link>
      </div>
    </main>
  )
}
