'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* ── Top Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[70px] bg-[#fffaf4] border-b-2 border-[#c2d9c2] shadow-sm">

        {/* Logo */}
        <Link href="/" className="font-lora text-xl font-semibold text-[#5c3d2e] hover:text-[#c4704f] transition-colors">
          Sunny<span className="text-[#c4704f]">Rays</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8 list-none">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm font-bold uppercase tracking-widest transition-colors relative group
                  ${pathname === href ? 'text-[#c4704f]' : 'text-[#8c6a57] hover:text-[#c4704f]'}`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#c4704f] rounded transition-all duration-300
                    ${pathname === href ? 'w-full' : 'w-0 group-hover:w-full'}`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger button (mobile only) */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-[5px] p-1.5 z-[200]"
        >
          <span
            className={`block w-6 h-[3px] bg-[#5c3d2e] rounded transition-all duration-300
              ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block w-6 h-[3px] bg-[#5c3d2e] rounded transition-all duration-300
              ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}
          />
          <span
            className={`block w-6 h-[3px] bg-[#5c3d2e] rounded transition-all duration-300
              ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {/* ── Mobile Slide-in Menu ── */}
      {/* Backdrop */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[300px] bg-[#fffaf4] shadow-2xl flex flex-col pt-24 px-8 gap-2 transition-transform duration-300 ease-in-out md:hidden
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <p className="font-lora italic text-[#8c6a57] text-sm mb-4">Navigation</p>
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={closeMenu}
            className={`font-bold uppercase tracking-widest text-sm py-3 border-b border-[#c2d9c2] transition-colors
              ${pathname === href ? 'text-[#c4704f]' : 'text-[#5c3d2e] hover:text-[#c4704f]'}`}
          >
            {label}
          </Link>
        ))}

        {/* CTA in drawer */}
        <Link
          href="/contact"
          onClick={closeMenu}
          className="mt-8 text-center bg-[#c4704f] text-white font-bold uppercase tracking-widest text-sm py-3 px-6 rounded-full hover:bg-[#e8956d] transition-colors"
        >
          Book a Session
        </Link>
      </div>
    </>
  )
}
