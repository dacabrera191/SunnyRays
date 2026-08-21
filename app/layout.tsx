import './theme.css'
import './globals.css'
import Navbar from '@/components/navbar'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sunny Rays Swim School',
  description: 'Swim lessons and coaching for all ages',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main className="pt-[70px]">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
