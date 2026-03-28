import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingStatsCard from './RatingStatsCard';
import ReviewSkeleton from './ReviewSkeleton';
import ReviewErrorState from './ReviewErrorState';
import EmptyState from '../ui/EmptyState';

const ReceivedReviewsPanel = ({ reviews, isLoading, error, stats, userId }) => {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );

  if (error) return <ReviewErrorState message={error} />;

  if (!reviews?.length)
    return (
      <EmptyState
        icon={<Inbox className="w-8 h-8" />}
        title={t('reviews.no_recommendations_received')}
        message={t('reviews.no_recommendations_received_desc')}
      />
    );

  return (
    <div className="space-y-5">
      {stats && <RatingStatsCard stats={stats} reviews={reviews} />}
      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewCard key={review._id} review={review} showActions={false} currentUserId={userId} />
        ))}
      </div>
    </div>
  );
};

export default ReceivedReviewsPanel;
