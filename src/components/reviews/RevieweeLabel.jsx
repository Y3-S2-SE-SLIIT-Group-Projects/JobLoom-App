import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

const RevieweeLabel = ({ review }) => {
  const { t } = useTranslation();
  const reviewee = review.revieweeId;
  if (!reviewee) return null;

  const name = `${reviewee.firstName ?? ''} ${reviewee.lastName ?? ''}`.trim();

  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-1 mb-1">
      <User className="w-3 h-3 shrink-0" />
      {t('reviews.reviewed_user')}{' '}
      <span className="font-semibold text-text">{name || t('reviews.anonymous')}</span>
    </p>
  );
};

export default RevieweeLabel;
