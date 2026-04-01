import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  User,
  CalendarDays,
  Briefcase,
  BadgeCheck,
  ThumbsUp,
  Quote,
  Images,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import ReviewCriteriaDisplay from './ReviewCriteriaDisplay';
import ReviewCardActions from './ReviewCardActions';
import ConfirmModal from './ConfirmModal';
import ReviewModal from './ReviewModal';
import { flagReview, removeReview, selectReviewLoading } from '../../store/slices/reviewSlice';
import { getImageUrl } from '../../utils/imageUrls';

const ratingAccent = rating =>
  rating >= 4 ? 'bg-emerald-500' : rating >= 3 ? 'bg-primary' : 'bg-amber-400';

const getPersonName = person => {
  if (!person || typeof person !== 'object') return '';
  const first = person.firstName ?? '';
  const last = person.lastName ?? '';
  return `${first} ${last}`.trim();
};

const normalizeId = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const canModifyByFallbackRules = review => {
  if (!review?.createdAt) return false;
  const createdAt = new Date(review.createdAt).getTime();
  if (Number.isNaN(createdAt)) return false;

  const within24Hours = Date.now() - createdAt < 24 * 60 * 60 * 1000;
  const hasReports = Array.isArray(review.reportedBy) && review.reportedBy.length > 0;
  return within24Hours || hasReports;
};

const ReviewCard = ({ review, showActions = false, currentUserId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isDeleting = useSelector(selectReviewLoading('delete'));
  const isReporting = useSelector(selectReviewLoading('report'));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const reviewer = review.reviewerId;
  const reviewerName = getPersonName(reviewer);
  const revieweeName = getPersonName(review.revieweeId);
  const displayName = reviewerName || (showActions ? revieweeName : '') || t('reviews.anonymous');
  const reviewImages = Array.isArray(review.images) ? review.images.filter(Boolean) : [];
  const hasDetailedRatings = ['workQuality', 'communication', 'punctuality', 'paymentOnTime'].some(
    key => review[key] != null
  );
  const hasExpandableContent = hasDetailedRatings || reviewImages.length > 0;
  const reviewerIdValue = normalizeId(reviewer);
  const currentUserIdValue = normalizeId(currentUserId);
  const isOwner = Boolean(currentUserIdValue) && reviewerIdValue === currentUserIdValue;
  const fallbackCanModify = canModifyByFallbackRules(review);
  const canEdit = review.canEdit ?? fallbackCanModify;
  const canDelete = review.canDelete ?? fallbackCanModify;

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
      <article
        id={`review-card-${review._id}`}
        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200"
      >
        {/* Side accent + header row */}
        <div className="flex">
          {/* Left accent stripe */}
          <div className={`w-1 shrink-0 ${ratingAccent(review.rating)}`} />

          <div className="flex-1 p-5 sm:p-6 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  {review.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <BadgeCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-text truncate text-sm leading-tight">
                    {displayName}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <CalendarDays className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Rating badge */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-text">{review.rating.toFixed(1)}</span>
                  <StarRating value={review.rating} size="text-sm" />
                </div>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant={review.reviewerType === 'employer' ? 'info' : 'success'}
                label={
                  review.reviewerType === 'employer'
                    ? t('reviews.employer')
                    : t('reviews.job_seeker')
                }
              />
              {review.wouldRecommend && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <ThumbsUp className="w-3 h-3" />
                  {t('reviews.would_recommend')}
                </span>
              )}
            </div>

            {(review.jobId?.title || hasExpandableContent) && (
              <div
                className={`mb-3 flex items-center gap-3 ${
                  review.jobId?.title ? 'justify-between' : 'justify-end'
                }`}
              >
                {review.jobId?.title && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <Briefcase className="w-3 h-3 text-primary" />
                    {review.jobId.title}
                  </div>
                )}

                {/* Expand/collapse */}
                {hasExpandableContent && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(prev => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
                    aria-expanded={isExpanded}
                    aria-controls={`review-details-${review._id}`}
                  >
                    {isExpanded
                      ? t('reviews.show_less_details', 'Show less details')
                      : t('reviews.show_more_details', 'Show more details')}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Comment */}
            {review.comment && (
              <div className="mb-3 flex gap-2.5">
                <Quote className="w-3.5 h-3.5 text-primary/30 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            )}

            {isExpanded && (
              <div id={`review-details-${review._id}`}>
                {/* Criteria */}
                <ReviewCriteriaDisplay review={review} />

                {/* Photos */}
                {reviewImages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <Images className="w-3 h-3" />
                      {t('reviews.photos')} ({reviewImages.length})
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {reviewImages.map((src, i) => (
                        <button
                          key={`${review._id}-img-${i}`}
                          type="button"
                          onClick={() => setExpandedImage(getImageUrl(src))}
                          aria-label={`${t('reviews.photos')} ${i + 1}`}
                          className="aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50 group/img"
                        >
                          <img
                            src={getImageUrl(src)}
                            alt={`Review attachment ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ReviewCardActions
                  isOwner={isOwner}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  isDeleting={isDeleting}
                  isReporting={isReporting}
                  onEdit={() => setShowEditModal(true)}
                  onDelete={() => setShowDeleteConfirm(true)}
                  onReport={() => setShowReportConfirm(true)}
                />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Image lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={expandedImage}
            alt={t('reviews.photos')}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <ReviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        existingReview={review}
        revieweeName={
          review.revieweeId ? `${review.revieweeId.firstName} ${review.revieweeId.lastName}` : ''
        }
        jobTitle={review.jobId?.title ?? ''}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('reviews.delete_review_title')}
        message={t('reviews.delete_review_message')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={showReportConfirm}
        title={t('reviews.report_review_title')}
        message={t('reviews.report_review_message')}
        confirmLabel={t('reviews.submit_report')}
        confirmVariant="danger"
        withInput
        inputLabel={t('reviews.report_reason_label')}
        inputPlaceholder={t('reviews.report_reason_placeholder')}
        onConfirm={handleReportConfirmed}
        onCancel={() => setShowReportConfirm(false)}
      />
    </>
  );
};

export default ReviewCard;
