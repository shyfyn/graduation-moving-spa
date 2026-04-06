import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFE3',
        ink: '#1D2433',
        accent: '#0F766E',
        shell: '#FBF7F1',
        cocoa: '#7C5535',
        mist: '#F2F4F8',
        yizhuang: {
          50: '#EEF6FF',
          100: '#D7E8FF',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        chaoyang: {
          50: '#FFF3E8',
          100: '#FFE1C7',
          500: '#EA580C',
          600: '#C2410C',
        },
      },
      boxShadow: {
        soft: '0 18px 40px rgba(27, 36, 51, 0.08)',
        float: '0 24px 60px rgba(27, 36, 51, 0.12)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['"MiSans"', '"HarmonyOS Sans SC"', '"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      backgroundImage: {
        'paper-grid': 'linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
        'shell-radial': 'radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 36%), radial-gradient(circle at top right, rgba(234, 88, 12, 0.12), transparent 32%), linear-gradient(180deg, #FBF7F1 0%, #F5EFE3 100%)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
    },
  },
  plugins: [],
}

export default config
