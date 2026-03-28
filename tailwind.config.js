/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Central palette: src/styles/colors.css (:root)
      colors: {
        'sky-light': 'var(--color-sky-light)',
        'blue-green': 'var(--color-blue-green)',
        'deep-blue': 'var(--color-deep-blue)',
        amber: 'var(--color-amber)',
        orange: 'var(--color-orange)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-dark': 'var(--color-text-dark)',
        muted: 'var(--color-text-muted)',
        subtle: 'var(--color-text-subtle)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          500: 'var(--color-neutral-500)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      // Typography: src/styles/typography.css (:root)
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      fontWeight: {
        normal: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
      },
      lineHeight: {
        tight: 'var(--leading-tight)',
        normal: 'var(--leading-normal)',
        loose: 'var(--leading-loose)',
      },
      letterSpacing: {
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
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
