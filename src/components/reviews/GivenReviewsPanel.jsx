import { FaPaperPlane } from 'react-icons/fa';

import ReviewCard from './ReviewCard';
import RevieweeLabel from './RevieweeLabel';
import ReviewSkeleton from './ReviewSkeleton';
import ReviewErrorState from './ReviewErrorState';
import EmptyState from '../ui/EmptyState';

const GivenReviewsPanel = ({ reviews, isLoading, error, userId }) => {
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
        icon={<FaPaperPlane />}
        title="No recommendations given yet"
        message="Recommendations you write for others will show up here."
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
