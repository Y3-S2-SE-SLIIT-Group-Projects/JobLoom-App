/**
 * Badge
 * Generic pill badge with semantic color variants.
 *
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 * @param {string} label   - Text inside the badge
 */
const VARIANT_CLASSES = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

const Badge = ({ variant = 'neutral', label }) => (
  <span
    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral}`}
  >
    {label}
  </span>
);

export default Badge;
