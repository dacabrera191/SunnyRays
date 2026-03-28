import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdf6ee]">

      {/* ── Hero / Bio Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">

        {/* Photo placeholder */}
        <div className="flex-shrink-0">
          <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-[#c2d9c2] border-4 border-[#8aab8a] flex items-center justify-center shadow-lg overflow-hidden">
            {/* Replace the div below with an <img> tag when you have a real photo */}
            <div className="text-center text-[#5c3d2e] px-4">
              <div className="text-5xl mb-2">👤</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8c6a57]">Your Photo Here</p>
            </div>
          </div>
        </div>

        {/* Bio text */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="font-lora italic text-[#c4704f] text-lg">Hello, I'm</p>
          <h1 className="font-lora text-4xl md:text-5xl font-semibold text-[#5c3d2e] leading-tight">
            Your Full Name
          </h1>
          <p className="text-[#8c6a57] font-bold uppercase tracking-widest text-sm">
            Academic Tutor &amp; Coach
          </p>
          <p className="text-[#5c3d2e] leading-relaxed max-w-xl">
            I help students build confidence and clarity in their studies. With over{' '}
            <strong>X years of experience</strong> in tutoring and academic coaching, I work
            one-on-one to find each student's strengths and create a personalized path to success.
          </p>
          <p className="text-[#5c3d2e] leading-relaxed max-w-xl">
            Whether you're preparing for exams, struggling with a subject, or just need a
            structured approach to learning — I'm here to guide you every step of the way.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
            <Link
              href="/contact"
              className="bg-[#c4704f] text-white font-bold uppercase tracking-widest text-sm py-3 px-7 rounded-full hover:bg-[#e8956d] transition-colors shadow-md"
            >
              Book a Session
            </Link>
            <Link
              href="/about"
              className="border-2 border-[#8aab8a] text-[#5c3d2e] font-bold uppercase tracking-widest text-sm py-3 px-7 rounded-full hover:bg-[#c2d9c2] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Highlights Strip ── */}
      <section className="bg-[#fffaf4] border-y-2 border-[#c2d9c2] py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🏊', stat: 'X+ Years', label: 'Teaching Experience' },
            { icon: '🧒', stat: 'X+ Students', label: 'Helped &amp; Counting' },
            { icon: '⭐', stat: '5-Star', label: 'Average Rating' },
          ].map(({ icon, stat, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{icon}</span>
              <p className="font-lora text-2xl font-semibold text-[#c4704f]">{stat}</p>
              <p
                className="text-sm font-semibold uppercase tracking-widest text-[#8c6a57]"
                dangerouslySetInnerHTML={{ __html: label }}
              />
            </div>
          ))}
        </div>
      </section>



      {/* ── Footer ── */}
      <footer className="bg-[#5c3d2e] text-[#c2d9c2] text-center py-8 text-sm">
        <p className="font-lora italic text-lg text-[#e8956d] mb-1">Your Name</p>
        <p className="uppercase tracking-widest text-xs mb-4">Tutor &amp; Academic Coach</p>
        <div className="flex justify-center gap-6 text-xs uppercase tracking-widest">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/schedule" className="hover:text-white transition-colors">Schedule</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="mt-6 text-xs text-[#8c6a57]">© {new Date().getFullYear()} Your Name. All rights reserved.</p>
      </footer>
    </div>
  )
}
