import './globals.css'
import Navbar from '@/components/navbar'

export const metadata = {
  title: 'Your Name | Tutor & Coach',
  description: 'Academic tutoring and coaching services',
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
