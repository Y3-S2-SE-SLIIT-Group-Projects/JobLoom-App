import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, PenLine, Lock, CheckCircle2, Inbox, Send, MessageSquareText } from 'lucide-react';
import useJobReviews from '../../hooks/useJobReviews';
import ReviewModal from './ReviewModal';
import Spinner from '../ui/Spinner';
import TabBadge from '../ui/TabBadge';
import ReceivedReviewsPanel from './ReceivedReviewsPanel';
import GivenReviewsPanel from './GivenReviewsPanel';

const TABS = {
  RECEIVED: 'received',
  GIVEN: 'given',
};

const normalizeId = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

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
  const { reviews, isLoading, error, refetch } = useJobReviews(jobId);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.RECEIVED);

  const isAccepted = applicationStatus === 'accepted';

  const hasCurrentUserReviewed = reviews.some(
    r => (r.reviewerId?._id ?? r.reviewerId)?.toString() === currentUserId?.toString()
  );

  const isCurrentUserEmployer = currentUserId?.toString() === employerId?.toString();
  const isCurrentUserSeeker = currentUserId?.toString() === jobSeekerId?.toString();
  const isParticipant = isCurrentUserEmployer || isCurrentUserSeeker;

  const modalRevieweeId = isCurrentUserEmployer ? jobSeekerId : employerId;
  const modalRevieweeName = isCurrentUserEmployer ? seekerName : employerName;
  const canWriteReview = isAccepted && isParticipant && !hasCurrentUserReviewed;
  const currentUserIdValue = normalizeId(currentUserId);

  const givenReviews = reviews.filter(
    review => normalizeId(review.reviewerId) === currentUserIdValue
  );

  const receivedReviews = reviews.filter(
    review => normalizeId(review.revieweeId) === currentUserIdValue
  );
  const hasReceivedReviews = receivedReviews.length > 0;
  const hasGivenReviews = givenReviews.length > 0;
  const hasUserScopedReviews = givenReviews.length > 0 || receivedReviews.length > 0;
  const effectiveActiveTab =
    activeTab === TABS.RECEIVED && !hasReceivedReviews && hasGivenReviews
      ? TABS.GIVEN
      : activeTab === TABS.GIVEN && !hasGivenReviews && hasReceivedReviews
        ? TABS.RECEIVED
        : activeTab;

  const tabCls = isActive =>
    [
      'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-text hover:border-gray-200',
    ].join(' ');

  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-primary" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-text leading-tight">
                {t('reviews.reviews_label')}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAccepted
                  ? t('reviews.no_reviews_for_job')
                  : t('reviews.reviews_after_acceptance')}
              </p>
            </div>
          </div>

          {reviews.length > 0 && (
            <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
              {t('reviews.total', { count: reviews.length })}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-5">
        {isAccepted &&
          isParticipant &&
          (canWriteReview ? (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              {t('reviews.write_review')}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('reviews.review_submitted_badge')}
            </span>
          ))}

        {!isAccepted && (
          <span className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
            <Lock className="w-3.5 h-3.5" />
            {applicationStatus === 'rejected'
              ? t('reviews.reviews_rejected')
              : t('reviews.reviews_locked')}
          </span>
        )}

        {!isLoading && hasUserScopedReviews && hasReceivedReviews && hasGivenReviews && (
          <div role="tablist" className="flex border-b border-gray-100">
            <button
              role="tab"
              aria-selected={effectiveActiveTab === TABS.RECEIVED}
              aria-controls="application-panel-received"
              onClick={() => setActiveTab(TABS.RECEIVED)}
              className={tabCls(effectiveActiveTab === TABS.RECEIVED)}
            >
              <Inbox className="w-3.5 h-3.5" />
              {t('reviews.tab_received')}
              <TabBadge count={receivedReviews.length} />
            </button>

            <button
              role="tab"
              aria-selected={effectiveActiveTab === TABS.GIVEN}
              aria-controls="application-panel-given"
              onClick={() => setActiveTab(TABS.GIVEN)}
              className={tabCls(effectiveActiveTab === TABS.GIVEN)}
            >
              <Send className="w-3.5 h-3.5" />
              {t('reviews.tab_sent')}
              <TabBadge count={givenReviews.length} />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoading && !hasUserScopedReviews && (
          <div className="py-8 sm:py-10 text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquareText className="w-4.5 h-4.5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-text">
              {isAccepted
                ? t(
                    'reviews.no_reviews_for_job',
                    'No reviews yet for this job. Be the first to leave one!'
                  )
                : t('reviews.reviews_after_acceptance')}
            </p>
          </div>
        )}

        {!isLoading && hasReceivedReviews && (
          <div
            role="tabpanel"
            id="application-panel-received"
            hidden={hasGivenReviews && effectiveActiveTab !== TABS.RECEIVED}
          >
            {(!hasGivenReviews || effectiveActiveTab === TABS.RECEIVED) && (
              <ReceivedReviewsPanel
                reviews={receivedReviews}
                isLoading={false}
                error={error}
                stats={null}
                userId={currentUserId}
              />
            )}
          </div>
        )}

        {!isLoading && hasGivenReviews && (
          <div
            role="tabpanel"
            id="application-panel-given"
            hidden={hasReceivedReviews && effectiveActiveTab !== TABS.GIVEN}
          >
            {(!hasReceivedReviews || effectiveActiveTab === TABS.GIVEN) && (
              <GivenReviewsPanel
                reviews={givenReviews}
                isLoading={false}
                error={error}
                userId={currentUserId}
              />
            )}
          </div>
        )}
      </div>

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
    </section>
  );
};

export default ApplicationReviewsPanel;
