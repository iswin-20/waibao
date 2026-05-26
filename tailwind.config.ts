import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 歪宝主题色 — 以 animal-island-ui 为灵感的温暖可爱风
        waibao: {
          primary: '#FF9B9B',    // 暖粉红 — 主色
          secondary: '#FFD93D',  // 暖黄 — 辅助色
          accent: '#6BCB77',     // 草绿 — 强调色
          bg: '#FFF8F0',         // 米白 — 背景
          card: '#FFFFFF',       // 卡片白
          text: '#4A4A4A',       // 深灰 — 正文
          'text-light': '#8B8B8B', // 浅灰 — 辅助文字
          pink: {
            light: '#FFE4E4',
            DEFAULT: '#FF9B9B',
            dark: '#FF6B6B',
          },
          yellow: {
            light: '#FFF3C4',
            DEFAULT: '#FFD93D',
            dark: '#FFC107',
          },
          green: {
            light: '#C8E6C9',
            DEFAULT: '#6BCB77',
            dark: '#4CAF50',
          },
          purple: {
            light: '#E8D5F5',
            DEFAULT: '#B388FF',
            dark: '#7C4DFF',
          },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'colored': '0 4px 14px 0 rgba(255, 155, 155, 0.3)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        cute: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-waibao': 'linear-gradient(135deg, #FFE4E4 0%, #FFF8F0 50%, #FFF3C4 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
        'gradient-primary': 'linear-gradient(135deg, #FF9B9B 0%, #FFB3B3 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF9B9B 0%, #FFD93D 100%)',
        'gradient-forest': 'linear-gradient(135deg, #6BCB77 0%, #A8E6CF 100%)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
