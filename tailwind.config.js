/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgb(var(--color-theme-bg) / ${opacityValue})`
            : `rgb(var(--color-theme-bg))`,
        'theme-primary': {
          DEFAULT: ({ opacityValue }) =>
            opacityValue !== undefined
              ? `rgb(var(--color-theme-primary) / ${opacityValue})`
              : `rgb(var(--color-theme-primary))`,
          active: ({ opacityValue }) =>
            opacityValue !== undefined
              ? `rgb(var(--color-theme-primary-active) / ${opacityValue})`
              : `rgb(var(--color-theme-primary-active))`,
        },
        'theme-secondary': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgb(var(--color-theme-secondary) / ${opacityValue})`
            : `rgb(var(--color-theme-secondary))`,
        'theme-accent': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgb(var(--color-theme-accent) / ${opacityValue})`
            : `rgb(var(--color-theme-accent))`,
        'theme-text-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
