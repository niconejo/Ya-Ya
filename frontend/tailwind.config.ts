import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Naranja de marca tomado del logo de Ya-Ya
        brand: {
          50: '#FFF3EC',
          100: '#FFE1CF',
          400: '#F1793D',
          500: '#E8641A',
          600: '#C74F0F',
        },
      },
    },
  },
  plugins: [],
};

export default config;
