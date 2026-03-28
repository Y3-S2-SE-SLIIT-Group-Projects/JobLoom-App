import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, PenLine, Lock, CheckCircle2 } from 'lucide-react';
import useJobReviews from '../../hooks/useJobReviews';
import ReviewModal from './ReviewModal';
import ReviewCard from './ReviewCard';
import Spinner from '../ui/Spinner';

const ApplicationReviewsPanel = ({
  jobId,
  employerId,
  jobSeekerId,
  currentUserId,
  applicationStatus,
  employerName = 'Employer',
  seekerName = 'Applicant',
  jobTitle = '',
}) => {
  const { t } = useTranslation();
  const { reviews, isLoading, refetch } = useJobReviews(jobId);
  const [modalOpen, setModalOpen] = useState(false);

  const isAccepted = applicationStatus === 'accepted';

  const seekerReview = reviews.find(
    r =>
      r.reviewerType === 'job_seeker' &&
      (r.reviewerId?._id ?? r.reviewerId)?.toString() === jobSeekerId?.toString()
  );
  const employerReview = reviews.find(
    r =>
      r.reviewerType === 'employer' &&
      (r.reviewerId?._id ?? r.reviewerId)?.toString() === employerId?.toString()
  );

  const hasCurrentUserReviewed = reviews.some(
    r => (r.reviewerId?._id ?? r.reviewerId)?.toString() === currentUserId?.toString()
  );

  const isCurrentUserEmployer = currentUserId?.toString() === employerId?.toString();
  const isCurrentUserSeeker = currentUserId?.toString() === jobSeekerId?.toString();
  const isParticipant = isCurrentUserEmployer || isCurrentUserSeeker;

  const modalRevieweeId = isCurrentUserEmployer ? jobSeekerId : employerId;
  const modalRevieweeName = isCurrentUserEmployer ? seekerName : employerName;
  const canWriteReview = isAccepted && isParticipant && !hasCurrentUserReviewed;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-text">{t('reviews.reviews_label')}</h3>
          {reviews.length > 0 && (
            <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 rounded-full px-2 py-0.5 font-medium">
              {reviews.length}
            </span>
          )}
        </div>

        {isAccepted &&
          isParticipant &&
          (canWriteReview ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              {t('reviews.write_review')}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('reviews.review_submitted_badge')}
            </span>
          ))}

        {!isAccepted && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
            <Lock className="w-3 h-3" />
            {applicationStatus === 'rejected'
              ? t('reviews.reviews_rejected')
              : t('reviews.reviews_locked')}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="py-4 text-xs text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-xl">
          {isAccepted ? t('reviews.no_reviews_for_job') : t('reviews.reviews_after_acceptance')}
        </p>
      )}

      {seekerReview && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t('reviews.seeker_review_of', { seekerName, employerName })}
          </p>
          <ReviewCard review={seekerReview} currentUserId={currentUserId} showActions />
        </div>
      )}

      {employerReview && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            {t('reviews.employer_review_of', { employerName, seekerName })}
          </p>
          <ReviewCard review={employerReview} currentUserId={currentUserId} showActions />
        </div>
      )}

      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        jobId={jobId}
        revieweeId={modalRevieweeId}
        revieweeName={modalRevieweeName}
        jobTitle={jobTitle}
        onSuccess={() => {
          setModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default ApplicationReviewsPanel;
