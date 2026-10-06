import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kangdarpet.com'),
  title: 'KANGDARPET | Premium Dog Toys Manufacturer in China – OEM & ODM',
  description:
    'KANGDARPET is a factory-direct dog toy manufacturer in China offering OEM & ODM plush, rubber, rope, interactive, puppy and tough chew toys for global pet brands.',
  keywords: [
    'dog toys manufacturer',
    'dog toy factory China',
    'OEM dog toys',
    'ODM pet toys',
    'plush dog toys',
    'rubber dog toys',
    'rope dog toys',
    'tough dog chew toys',
    'wholesale dog toys',
  ],
  generator: 'v0.app',
  openGraph: {
    title: 'KANGDARPET | Premium Dog Toys Manufacturer in China',
    description: 'OEM & ODM Dog Toy Solutions for Global Brands.',
    type: 'website',
    siteName: 'KANGDARPET',
    images: ['/images/hero.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/images/hero.png'] },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ff6a00',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} bg-background scroll-smooth`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
