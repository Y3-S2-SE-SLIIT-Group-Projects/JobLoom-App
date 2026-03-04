import { FaInbox } from 'react-icons/fa';

import ReviewCard from './ReviewCard';
import RatingStatsCard from './RatingStatsCard';
import ReviewSkeleton from './ReviewSkeleton';
import ReviewErrorState from './ReviewErrorState';
import EmptyState from '../ui/EmptyState';

const ReceivedReviewsPanel = ({ reviews, isLoading, error, stats, userId }) => {
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
        icon={<FaInbox />}
        title="No recommendations yet"
        message="When someone recommends you, it will appear here."
      />
    );

  return (
    <div className="space-y-4">
      {stats && <RatingStatsCard stats={stats} />}
      {reviews.map(review => (
        <ReviewCard key={review._id} review={review} showActions={false} currentUserId={userId} />
      ))}
    </div>
  );
};

export default ReceivedReviewsPanel;
