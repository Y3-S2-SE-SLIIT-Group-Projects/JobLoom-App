import { FaThumbsUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import ReviewCriteriaDisplay from './ReviewCriteriaDisplay';
import ReviewCardActions from './ReviewCardActions';
import { flagReview, removeReview, selectReviewLoading } from '../../store/slices/reviewSlice';

/**
 * ReviewCard
 * Displays a single review with reviewer info, ratings, criteria, and actions.
 *
 * @param {Object}  review         - Review object from API
 * @param {boolean} showActions    - Show delete / report buttons
 * @param {string}  currentUserId  - Logged-in user's ID
 */
const ReviewCard = ({ review, showActions = false, currentUserId }) => {
  const dispatch = useDispatch();
  const isDeleting = useSelector(selectReviewLoading('delete'));
  const isReporting = useSelector(selectReviewLoading('report'));

  const reviewer = review.reviewerId;
  const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Anonymous';

  const isOwner = currentUserId && reviewer?._id === currentUserId;

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      dispatch(removeReview(review._id));
    }
  };

  const handleReport = () => {
    const reason = window.prompt('Reason for reporting this review:');
    if (reason?.trim()) {
      dispatch(flagReview({ reviewId: review._id, reason: reason.trim() }));
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-[#2B373F]">{reviewerName}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating value={review.rating} size="text-base" />
          <span className="text-xs text-gray-500 font-medium">{review.rating.toFixed(1)} / 5</span>
        </div>
      </div>

      {/* Reviewer type badge + verified */}
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant={review.reviewerType === 'employer' ? 'info' : 'success'}
          label={review.reviewerType === 'employer' ? 'Employer' : 'Job Seeker'}
        />
        {review.isVerified && <Badge variant="success" label="✓ Verified" />}
        {review.wouldRecommend && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <FaThumbsUp className="text-xs" />
            Would recommend
          </span>
        )}
      </div>

      {/* Job reference */}
      {review.jobId?.title && (
        <p className="text-xs text-gray-400 mb-3">
          Job: <span className="text-gray-600 font-medium">{review.jobId.title}</span>
        </p>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.comment}</p>
      )}

      {/* Detailed criteria */}
      <ReviewCriteriaDisplay review={review} />

      {/* Actions */}
      {showActions && (
        <ReviewCardActions
          isOwner={isOwner}
          isDeleting={isDeleting}
          isReporting={isReporting}
          onDelete={handleDelete}
          onReport={handleReport}
        />
      )}
    </article>
  );
};

export default ReviewCard;
