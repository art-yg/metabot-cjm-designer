import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CJM Designer',
  description: 'Custom Journey Map Designer - Visual flow builder for customer journeys',
  generator: 'CJM Designer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
