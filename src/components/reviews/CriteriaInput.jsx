import StarRating from '../ui/StarRating';

/**
 * CriteriaInput
 * Single row for rating a review sub-criterion interactively.
 *
 * @param {string}   label    - Criterion label
 * @param {string}   field    - Form field name
 * @param {number}   value    - Current rating (0–5)
 * @param {Function} onChange - Called with (field, value)
 */
const CriteriaInput = ({ label, field, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-700 w-40">{label}</span>
    <StarRating value={value} interactive onChange={v => onChange(field, v)} size="text-xl" />
    <span className="text-sm text-gray-500 w-8 text-right">{value || '–'}</span>
  </div>
);

export default CriteriaInput;
