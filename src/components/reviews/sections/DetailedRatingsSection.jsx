import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CriteriaInput from '../CriteriaInput';

const EMPLOYER_CRITERIA = ['workQuality', 'communication', 'punctuality'];
const SEEKER_CRITERIA = ['communication', 'paymentOnTime'];

const CRITERIA_KEYS = {
  workQuality: 'reviews.criteria_work_quality',
  communication: 'reviews.criteria_communication',
  punctuality: 'reviews.criteria_punctuality',
  paymentOnTime: 'reviews.criteria_payment_on_time',
};

const DetailedRatingsSection = ({
  form,
  isEmployer,
  setField,
  onPrev,
  onNext,
  showPrev = true,
}) => {
  const { t } = useTranslation();
  const criteria = isEmployer ? EMPLOYER_CRITERIA : SEEKER_CRITERIA;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-0.5">
          {t('reviews.detailed_ratings_label')} <span className="text-red-400">*</span>
        </p>
        <p className="text-xs text-gray-400">
          {isEmployer
            ? t('reviews.detailed_ratings_hint_employer')
            : t('reviews.detailed_ratings_hint_seeker')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Overall score is auto-calculated from these ratings.
        </p>
      </div>

      <div className="bg-gray-50/60 border border-gray-100 rounded-xl px-4 divide-y divide-gray-100">
        {criteria.map(key => (
          <CriteriaInput
            key={key}
            label={t(CRITERIA_KEYS[key])}
            field={key}
            value={form[key]}
            onChange={setField}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        {showPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:border-primary/30 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.previous')}
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DetailedRatingsSection;
