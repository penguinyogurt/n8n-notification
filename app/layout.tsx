import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unified Dashboard',
  description: 'Unified dashboard for n8n notifications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-text-light-primary dark:text-text-dark-primary">
        {children}
      </body>
    </html>
  )
}