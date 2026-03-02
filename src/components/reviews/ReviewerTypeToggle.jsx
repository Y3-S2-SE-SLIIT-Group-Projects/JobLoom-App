const REVIEWER_TYPES = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'employer', label: 'Employer' },
];

/**
 * ReviewerTypeToggle
 * Two-button toggle for switching between reviewer role types.
 *
 * @param {string}   value    - Current reviewerType value
 * @param {Function} onChange - Called with the selected value string
 */
const ReviewerTypeToggle = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">I am reviewing as…</label>
    <div className="flex gap-3">
      {REVIEWER_TYPES.map(type => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={[
            'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors',
            value === type.value
              ? 'bg-[#6794D1] border-[#6794D1] text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:border-[#6794D1]',
          ].join(' ')}
        >
          {type.label}
        </button>
      ))}
    </div>
  </div>
);

export default ReviewerTypeToggle;
