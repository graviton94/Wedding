/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#0F0F0F',
        'theme-primary': '#FF6F61', // Living Coral
        'theme-secondary': '#E37383', // Indigo Pink
        'theme-accent': '#FFB347', // Sunset Orange
        'theme-text-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
