/**
 * Class fragments referencing ONLY :root variables from
 * src/styles/colors.css and src/styles/typography.css (via index.css).
 * Layout/spacing/shadow utilities stay as plain Tailwind.
 */
export const C = {
  primary: 'text-[color:var(--color-primary)]',
  text: 'text-[color:var(--color-text-primary)]',
  muted: 'text-[color:var(--color-text-muted)]',
  subtle: 'text-[color:var(--color-text-subtle)]',
  error: 'text-[color:var(--color-error)]',
  bgSurface: 'bg-[color:var(--color-surface)]',
  bgSurfaceMuted: 'bg-[color:var(--color-surface-muted)]',
  hoverSurfaceMuted: 'hover:bg-[color:var(--color-surface-muted)]',
  bgPrimary: 'bg-[color:var(--color-primary)]',
  bgSkyLight50: 'bg-[color:color-mix(in_srgb,var(--color-sky-light)_50%,transparent)]',
  hoverSkyLight40: 'hover:bg-[color:color-mix(in_srgb,var(--color-sky-light)_40%,transparent)]',
  hoverSkyLightSolid: 'hover:bg-[color:var(--color-sky-light)]',
  hoverDeepBlue: 'hover:bg-[color:var(--color-deep-blue)]',
  border: 'border-[color:var(--color-border)]',
  borderError25: 'border-[color:color-mix(in_srgb,var(--color-error)_25%,transparent)]',
  bgError10: 'bg-[color:color-mix(in_srgb,var(--color-error)_10%,transparent)]',
  borderPrimary: 'border-[color:var(--color-primary)]',
  bgNeutral100: 'bg-[color:var(--color-neutral-100)]',
  textOnPrimary: 'text-[color:var(--color-surface)]',
  placeholderSubtle: 'placeholder:text-[color:var(--color-text-subtle)]',
};

export const T = {
  body: '[font-family:var(--font-body)]',
  heading: '[font-family:var(--font-heading)]',
  xs: 'text-[var(--text-xs)]',
  sm: 'text-[var(--text-sm)]',
  base: 'text-[var(--text-base)]',
  lg: 'text-[var(--text-lg)]',
  xl: 'text-[var(--text-xl)]',
  '2xl': 'text-[var(--text-2xl)]',
  '5xl': 'text-[var(--text-5xl)]',
  regular: 'font-[var(--font-weight-regular)]',
  medium: 'font-[var(--font-weight-medium)]',
  semibold: 'font-[var(--font-weight-semibold)]',
  bold: 'font-[var(--font-weight-bold)]',
  extrabold: 'font-[var(--font-weight-extrabold)]',
  leadingTight: 'leading-[var(--leading-tight)]',
  leadingLoose: 'leading-[var(--leading-loose)]',
  trackingTight: 'tracking-[var(--tracking-tight)]',
  trackingNormal: 'tracking-[var(--tracking-normal)]',
  trackingWide: 'tracking-[var(--tracking-wide)]',
};
