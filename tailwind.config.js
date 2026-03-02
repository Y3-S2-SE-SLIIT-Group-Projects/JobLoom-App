/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // FlowOps Color Palette
      colors: {
        text: '#1D283A',
        background: '#F5F7FA',
        primary: '#6895D2',
        secondary: '#2DD4BF',
        accent: '#A78BFA',
        warning: '#FBBF24',
        error: '#EF4444',
        success: '#10B981',
        info: '#3B82F6',
      },
      // FlowOps Font Sizes
      fontSize: {
        sm: '0.600rem', // 9.6px
        base: '0.8rem', // 12.8px
        xl: '1.066rem', // 17px
        '2xl': '1.421rem', // 22.7px
        '3xl': '1.894rem', // 30.3px
        '4xl': '2.525rem', // 40.4px
        '5xl': '3.366rem', // 53.9px
      },
      // FlowOps Font Families
      fontFamily: {
        heading: ['Spectral', 'serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      // FlowOps Spacing (8px base)
      spacing: {
        xs: '0.5rem', // 8px
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
        xl: '3rem', // 48px
        '2xl': '4rem', // 64px
        '3xl': '6rem', // 96px
      },
      // FlowOps Border Radius
      borderRadius: {
        card: '1rem', // 16px
        feature: '1.5rem', // 24px
        button: '0.75rem', // 12px
      },
      // FlowOps Box Shadows
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        feature: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      // FlowOps Backdrop Blur
      backdropBlur: {
        glass: '12px',
        'glass-strong': '16px',
      },
    },
  },
  plugins: [],
};
