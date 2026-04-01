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
    <div className="space-y-6">
      <div className="py-1 pl-4 border-l-2 border-primary/30 sm:pl-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary mb-1.5">
          {t('reviews.section_detailed')}
        </p>
        <p className="mb-1 text-lg font-semibold text-text">
          {t('reviews.detailed_ratings_label')} <span className="text-red-400">*</span>
        </p>
        <p className="text-sm text-gray-500">
          {isEmployer
            ? t('reviews.detailed_ratings_hint_employer')
            : t('reviews.detailed_ratings_hint_seeker')}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Overall score is auto-calculated from these ratings.
        </p>
      </div>

      <div className="px-5 border border-gray-100 divide-y divide-gray-100 bg-gray-50/70 rounded-2xl sm:px-6">
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

      <div className="flex items-center justify-between pt-3">
        {showPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
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
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-sm hover:shadow transition-colors"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DetailedRatingsSection;
