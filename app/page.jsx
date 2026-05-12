import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page">

      {/* ── Hero / Bio Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">

        {/* Photo placeholder */}
        <div className="flex-shrink-0">
          <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-mist border-4 border-sky flex items-center justify-center shadow-lg overflow-hidden">
            {/* Replace the div below with an <img> tag when you have a real photo */}
            <div className="text-center text-ink px-4">
              <div className="text-5xl mb-2">🏊</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Your Photo Here</p>
            </div>
          </div>
        </div>

        {/* Bio text */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <p className="font-lora italic text-secondary text-lg">Hello, I'm</p>
          <h1 className="font-lora text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Madison Weinhauer
          </h1>
          <p className="text-ink-muted font-bold uppercase tracking-widest text-sm">
            Swim Instructor &amp; Coach
          </p>
          <p className="text-ink leading-relaxed max-w-xl">
            I help swimmers of all ages build confidence and skill in the water. With over{' '}
            <strong>X years of experience</strong> teaching swim lessons, I work
            one-on-one to find each swimmer's strengths and create a personalized path to success.
          </p>
          <p className="text-ink leading-relaxed max-w-xl">
            Whether you're a beginner taking your first strokes, working on technique, or
            preparing for competition — I'm here to guide you every step of the way.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
            <Link
              href="/contact"
              className="bg-primary text-primary-contrast font-bold uppercase tracking-widest text-sm py-3 px-7 rounded-full hover:bg-primary-hover transition-colors shadow-md"
            >
              Book a Session
            </Link>
            <Link
              href="/about"
              className="border-2 border-secondary text-ink font-bold uppercase tracking-widest text-sm py-3 px-7 rounded-full hover:bg-mist transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Highlights Strip ── */}
      <section className="bg-surface border-y-2 border-sky/40 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🏊', stat: 'X+ Years', label: 'Teaching Experience' },
            { icon: '🧒', stat: 'X+ Students', label: 'Helped &amp; Counting' },
            { icon: '⭐', stat: '5-Star', label: 'Average Rating' },
          ].map(({ icon, stat, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{icon}</span>
              <p className="font-lora text-2xl font-semibold text-primary">{stat}</p>
              <p
                className="text-sm font-semibold uppercase tracking-widest text-ink-muted"
                dangerouslySetInnerHTML={{ __html: label }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy text-mist text-center py-8 text-sm">
        <p className="font-lora italic text-lg text-accent mb-1">Madison Weinhauer</p>
        <p className="uppercase tracking-widest text-xs mb-4">Swim Instructor &amp; Coach</p>
        <div className="flex justify-center gap-6 text-xs uppercase tracking-widest">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/schedule" className="hover:text-white transition-colors">Schedule</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="mt-6 text-xs text-ink-muted">© {new Date().getFullYear()} Your Name. All rights reserved.</p>
      </footer>
    </div>
  )
}
