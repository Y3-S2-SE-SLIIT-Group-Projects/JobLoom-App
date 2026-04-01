import StarRating from '../ui/StarRating';

const CriteriaInput = ({ label, field, value, onChange }) => (
  <div className="flex items-center justify-between gap-5 py-3.5">
    <span className="text-[15px] font-medium text-gray-700 min-w-0 flex-1">{label}</span>
    <div className="flex items-center gap-3.5 shrink-0">
      <StarRating value={value} interactive onChange={v => onChange(field, v)} size="text-xl" />
      <span className="text-sm font-bold text-gray-500 w-7 h-7 rounded-lg bg-white border border-gray-200 inline-flex items-center justify-center">
        {value || '–'}
      </span>
    </div>
  </div>
);

export default CriteriaInput;
