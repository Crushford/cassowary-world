'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DocumentCategory {
  id: string
  name: string
  description: string
  href: string
  icon: string
}

interface SidebarProps {
  documentCategories: DocumentCategory[]
}

export default function Sidebar({ documentCategories }: SidebarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show sidebar when at top, hide when scrolling down
      if (currentScrollY <= 100) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at top
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return (
    <>
      {/* Mobile menu button - positioned outside sidebar */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-all duration-300 ${
          isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          backgroundColor: 'var(--color-cassowary)',
          color: 'white'
        }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <aside
        className={`sidebar lg:w-80 shadow-lg border-r border-solid fixed lg:relative top-0 left-0 h-screen lg:h-auto z-50 transition-transform duration-300 ease-in-out ${
          isVisible || isMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          top: 'var(--header-height, 0px)',
          height: 'calc(100vh - var(--header-height, 0px))'
        }}
      >
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
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}
