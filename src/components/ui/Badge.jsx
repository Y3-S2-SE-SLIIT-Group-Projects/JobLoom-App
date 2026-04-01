/**
 * Badge
 * Generic pill badge with semantic color variants.
 *
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 * @param {string} label   - Text inside the badge
 */
const VARIANT_CLASSES = {
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-secondary/10 text-secondary border-secondary/30',
  danger: 'bg-error/10 text-error border-error/30',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-neutral-100 text-muted border-border',
};

const Badge = ({ variant = 'neutral', label }) => (
  <span
    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral}`}
  >
    {label}
  </span>
);

export default Badge;
