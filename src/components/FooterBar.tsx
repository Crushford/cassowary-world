import Link from 'next/link'

export default function FooterBar() {
  return (
    <footer className="footer-bar bg-[var(--background)] border-t border-[var(--color-wattle-yellow)/30]">
      <div className="container mx-auto px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-[var(--foreground)] gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span>📖</span>
            <span>
              This project is open source —{' '}
              <a
                href="https://cassowary-world.sanity.studio/"
                className="footer-link underline hover:text-[var(--color-wattle-yellow)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit on Sanity
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛠️</span>
            <span>
              Want to contribute?{' '}
              <a
                href="https://github.com/Crushford/cassowary-world"
                className="footer-link underline hover:text-[var(--color-wattle-yellow)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit on GitHub
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
