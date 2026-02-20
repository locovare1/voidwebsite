import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: {
          50: '#f5e6ff',
          100: '#e6ccff',
          200: '#d4a6ff',
          300: '#c280ff',
          400: '#b059ff',
          500: '#9E47B2',
          600: '#740FA8',
          700: '#5d0c86',
          800: '#460965',
          900: '#2f0643',
        },
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #740FA8 0%, #9E47B2 100%)',
        'purple-gradient-subtle': 'linear-gradient(135deg, rgba(116, 15, 168, 0.1) 0%, rgba(158, 71, 178, 0.1) 100%)',
        'void-purple': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #740FA8 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
