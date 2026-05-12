/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (raw names — match theme.css)
        sky: {
          DEFAULT: "var(--sr-sky)",
        },
        ocean: "var(--sr-ocean)",
        navy: {
          DEFAULT: "var(--sr-navy)",
          deep: "var(--sr-navy-deep)",
        },
        sun: {
          DEFAULT: "var(--sr-sun)",
          soft: "var(--sr-sun-soft)",
        },
        coral: "var(--sr-coral)",
        cream: "var(--sr-cream)",
        mist: "var(--sr-mist)",

        // Semantic tokens (USE THESE in components)
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          contrast: "var(--color-primary-contrast)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          contrast: "var(--color-accent-contrast)",
        },
        highlight: "var(--color-highlight)",
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        ink: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      backgroundColor: {
        page: "var(--color-bg)",
      },
    },
  },
  plugins: [],
};