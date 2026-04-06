import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F6F1E8',
        ink: '#1F2937',
        accent: '#0F766E',
        yizhuang: {
          50: '#EEF6FF',
          100: '#DDEEFF',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        chaoyang: {
          50: '#FFF4EB',
          100: '#FFE6D2',
          500: '#EA580C',
          600: '#C2410C',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      backgroundImage: {
        'paper-grid': 'linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
    },
  },
  plugins: [],
}

export default config
