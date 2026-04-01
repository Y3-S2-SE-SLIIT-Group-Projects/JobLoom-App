import { useTranslation } from 'react-i18next';

const TYPES = [
  { value: 'job_seeker', key: 'reviews.job_seeker' },
  { value: 'employer', key: 'reviews.employer' },
];

const ReviewerTypeToggle = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('reviews.reviewing_as')}
      </label>
      <div className="flex gap-2">
        {TYPES.map(type => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={[
              'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              value === type.value
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-primary/40',
            ].join(' ')}
          >
            {t(type.key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReviewerTypeToggle;
