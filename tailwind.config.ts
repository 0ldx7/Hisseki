import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      //Conceptのアイコンアニメーション
      animation: {
        'fade-down': 'fadeDown 2s infinite',
        'initial-invisible': 'initialInvisible 1.8s forwards'
      },
      keyframes: {
        //Conceptのロード直後のちらつきを防止
        fadeDown: {
          '0%': {
            transform: 'translateY(0)' ,
            opacity: '0',
          },
          '30%': {
            opacity: '100',
          },
          '100%': { transform: 'translateY(20px)' },
        },
        initialInvisible: {
          '0%': { opacity: '0' },
          '49%': { opacity: '0' },
          '100%': { opacity: '100' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
