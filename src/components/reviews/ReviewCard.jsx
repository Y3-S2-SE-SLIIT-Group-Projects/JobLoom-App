import { useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import ReviewCriteriaDisplay from './ReviewCriteriaDisplay';
import ReviewCardActions from './ReviewCardActions';
import ConfirmModal from './ConfirmModal';
import ReviewModal from './ReviewModal';
import { flagReview, removeReview, selectReviewLoading } from '../../store/slices/reviewSlice';

/**
 * ReviewCard
 * Displays a single review with reviewer info, ratings, criteria, and actions.
 *
 * @param {Object}  review         - Review object from API
 * @param {boolean} showActions    - Show edit / delete / report buttons
 * @param {string}  currentUserId  - Logged-in user's ID
 */
const ReviewCard = ({ review, showActions = false, currentUserId }) => {
  const dispatch = useDispatch();
  const isDeleting = useSelector(selectReviewLoading('delete'));
  const isReporting = useSelector(selectReviewLoading('report'));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const reviewer = review.reviewerId;
  const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Anonymous';

  const isOwner = currentUserId && reviewer?._id === currentUserId;

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirm(false);
    dispatch(removeReview(review._id));
  };

  const handleReportConfirmed = reason => {
    setShowReportConfirm(false);
    dispatch(flagReview({ reviewId: review._id, reason }));
  };

  return (
    <>
      <article className="bg-surface rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-semibold text-text-dark">{reviewerName}</p>
            <p className="text-xs text-subtle">{formattedDate}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StarRating value={review.rating} size="text-base" />
            <span className="text-xs text-subtle font-medium">{review.rating.toFixed(1)} / 5</span>
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
            <span className="flex items-center gap-1 text-xs text-success">
              <FaThumbsUp className="text-xs" />
              Would recommend
            </span>
          )}
        </div>

        {/* Job reference */}
        {review.jobId?.title && (
          <p className="text-xs text-subtle mb-3">
            Job: <span className="text-muted font-medium">{review.jobId.title}</span>
          </p>
        )}

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-muted leading-relaxed mb-4">{review.comment}</p>
        )}

        {/* Detailed criteria */}
        <ReviewCriteriaDisplay review={review} />

        {/* Actions */}
        {showActions && (
          <ReviewCardActions
            isOwner={isOwner}
            isDeleting={isDeleting}
            isReporting={isReporting}
            onEdit={() => setShowEditModal(true)}
            onDelete={() => setShowDeleteConfirm(true)}
            onReport={() => setShowReportConfirm(true)}
          />
        )}
      </article>

      {/* Edit Modal */}
      <ReviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        existingReview={review}
        revieweeName={
          review.revieweeId ? `${review.revieweeId.firstName} ${review.revieweeId.lastName}` : ''
        }
        jobTitle={review.jobId?.title ?? ''}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Report Confirm */}
      <ConfirmModal
        isOpen={showReportConfirm}
        title="Report Review"
        message="Please describe why you are reporting this review."
        confirmLabel="Submit Report"
        confirmVariant="danger"
        withInput
        inputLabel="Reason"
        inputPlaceholder="e.g. This review contains inaccurate information…"
        onConfirm={handleReportConfirmed}
        onCancel={() => setShowReportConfirm(false)}
      />
    </>
  );
};

export default ReviewCard;
