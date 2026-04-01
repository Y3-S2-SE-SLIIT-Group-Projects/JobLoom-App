import { useTranslation } from 'react-i18next';
import CriteriaBar from './CriteriaBar';

const CRITERIA = [
  { key: 'workQuality', i18nKey: 'reviews.criteria_work_quality', showFor: 'both' },
  { key: 'communication', i18nKey: 'reviews.criteria_communication', showFor: 'both' },
  { key: 'punctuality', i18nKey: 'reviews.criteria_punctuality', showFor: 'job_seeker' },
  { key: 'paymentOnTime', i18nKey: 'reviews.criteria_payment_on_time', showFor: 'employer' },
];

const ReviewCriteriaDisplay = ({ review }) => {
  const { t } = useTranslation();

  const visible = CRITERIA.filter(({ key, showFor }) => {
    if (review[key] == null) return false;
    if (showFor === 'both') return true;
    return review.reviewerType === (showFor === 'job_seeker' ? 'employer' : 'job_seeker');
  });

  if (visible.length === 0) return null;

  return (
    <div className="mt-4 px-4 py-3 bg-gray-50/60 border border-gray-100 rounded-xl space-y-2.5">
      {visible.map(({ key, i18nKey }) => (
        <CriteriaBar key={key} label={t(i18nKey)} value={review[key]} />
      ))}
    </div>
  );
};

export default ReviewCriteriaDisplay;
