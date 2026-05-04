import './globals.css'
import navbar from '../components/navbar'

export const metadata = {
  title: 'Your Name | Tutor & Coach',
  description: 'Academic tutoring and coaching services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <navbar />
        <main className="pt-[70px]">
          {children}
        </main>
      </body>
    </html>
  )
}
