import StarRating from '../ui/StarRating';

const CriteriaInput = ({ label, field, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <span className="text-sm text-gray-600 min-w-0 flex-1">{label}</span>
    <div className="flex items-center gap-3 shrink-0">
      <StarRating value={value} interactive onChange={v => onChange(field, v)} size="text-lg" />
      <span className="text-sm font-semibold text-gray-400 w-5 text-center">
        {value || '–'}
      </span>
    </div>
  </div>
);

export default CriteriaInput;
