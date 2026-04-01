import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PenLine, Inbox } from 'lucide-react';
import useUserReviews from '../../hooks/useUserReviews';
import useRatingStats from '../../hooks/useRatingStats';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingStatsCard from '../../components/reviews/RatingStatsCard';
import ReviewFilterBar from '../../components/reviews/ReviewFilterBar';
import ReviewSkeleton from '../../components/reviews/ReviewSkeleton';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import AlertBanner from '../../components/ui/AlertBanner';
import {
  selectReviewerTypeFilter,
  selectReviewSort,
  selectReviewPage,
  setPage,
} from '../../store/slices/reviewSlice';

const PAGE_SIZE = 10;

const UserReviewsPage = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const dispatch = useDispatch();
  const currentUserId = useSelector(state => state.user?.currentUser?._id);
  const isOwnProfile = currentUserId === userId;

  const reviewerType = useSelector(selectReviewerTypeFilter);
  const sort = useSelector(selectReviewSort);
  const page = useSelector(selectReviewPage);

  const queryParams = {
    ...(reviewerType && { reviewerType }),
    sort,
    page,
    limit: PAGE_SIZE,
  };

  const { reviews, pagination, isLoading, error } = useUserReviews(userId, queryParams);
  const { stats, isLoading: statsLoading } = useRatingStats(userId);

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/"
            aria-label={t('common.back')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">{t('reviews.user_reviews_title')}</h1>
            <p className="text-sm text-gray-400">{t('reviews.user_reviews_subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            {statsLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <RatingStatsCard stats={stats} />
            )}

            {!isOwnProfile && currentUserId && (
              <Link
                to={`/reviews/submit?revieweeId=${userId}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <PenLine className="w-4 h-4" />
                {t('reviews.write_review_cta')}
              </Link>
            )}
          </aside>

          {/* Main content */}
          <section className="flex-1 min-w-0">
            <div className="mb-5">
              <ReviewFilterBar />
            </div>

            <AlertBanner type="error" message={error} />

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={<Inbox className="w-8 h-8" />}
                title={t('reviews.no_reviews_title')}
                description={t('reviews.no_reviews_desc')}
              />
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      currentUserId={currentUserId}
                      showActions={!!currentUserId}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:border-primary/30 transition-colors"
                    >
                      {t('common.previous')}
                    </button>
                    <span className="text-sm text-gray-500">
                      {t('common.page_of', { current: page, total: totalPages })}
                    </span>
                    <button
                      onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:border-primary/30 transition-colors"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserReviewsPage;
