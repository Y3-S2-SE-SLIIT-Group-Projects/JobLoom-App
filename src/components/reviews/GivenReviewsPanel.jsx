import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RevieweeLabel from './RevieweeLabel';
import ReviewSkeleton from './ReviewSkeleton';
import ReviewErrorState from './ReviewErrorState';
import EmptyState from '../ui/EmptyState';

const GivenReviewsPanel = ({ reviews, isLoading, error, userId }) => {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => <ReviewSkeleton key={i} />)}
      </div>
    );

  if (error) return <ReviewErrorState message={error} />;

  if (!reviews?.length)
    return (
      <EmptyState
        icon={<Send className="w-8 h-8" />}
        title={t('reviews.no_recommendations_given')}
        message={t('reviews.no_recommendations_given_desc')}
      />
    );

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review._id}>
          <RevieweeLabel review={review} />
          <ReviewCard review={review} showActions currentUserId={userId} />
        </div>
      ))}
    </div>
  );
};

export default GivenReviewsPanel;
