import './theme.css'
import './globals.css'
import Navbar from '@/components/navbar'

export const metadata = {
  title: 'Sunny Rays Swim School',
  description: 'Swim lessons and coaching for all ages',
}

export default function RootLayout({ children }) {
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