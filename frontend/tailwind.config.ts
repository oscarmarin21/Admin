import type { Config } from 'tailwindcss';
import flowbitePlugin from 'flowbite/plugin';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          50: '#f5f8ff',
          100: '#e0e9ff',
          200: '#c7d5fe',
          300: '#a8befc',
          400: '#7f9cfa',
          500: '#5678f6',
          600: '#3c5de0',
          700: '#2f4ac0',
          800: '#283d9a',
          900: '#25397d',
        },
      },
    },
  },
  plugins: [flowbitePlugin],
};

export default config;

