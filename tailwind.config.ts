import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)'
      },
      colors: {
        cassowary: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          fern: 'var(--color-fern)',
          'leaf-shadow': 'var(--color-leaf-shadow)',
          'bird-blue': 'var(--color-bird-blue)',
          cassowary: 'var(--color-cassowary)',
          'wattle-yellow': 'var(--color-wattle-yellow)'
        }
      }
    }
  }
}

export default config
