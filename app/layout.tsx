import './theme.css'
import './globals.css'
import Navbar from '@/components/navbar'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sunny Rays Swim School',
  description: 'Swim lessons and coaching for all ages',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="pt-[70px]">
          {children}
        </main>
      </body>
    </html>
  )
}
