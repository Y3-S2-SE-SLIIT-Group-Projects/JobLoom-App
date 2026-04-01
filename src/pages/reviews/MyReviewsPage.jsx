import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Inbox, Send, Star, Info } from 'lucide-react';
import useUserReviews from '../../hooks/useUserReviews';
import useSentReviews from '../../hooks/useSentReviews';
import useRatingStats from '../../hooks/useRatingStats';
import ReviewCard from '../../components/reviews/ReviewCard';
import ReviewFilterBar from '../../components/reviews/ReviewFilterBar';
import RatingStatsCard from '../../components/reviews/RatingStatsCard';
import ReviewSkeleton from '../../components/reviews/ReviewSkeleton';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import AlertBanner from '../../components/ui/AlertBanner';
import DottedBackground from '../../components/DottedBackground';
import {
  selectActiveTab,
  selectReviewerTypeFilter,
  selectReviewSort,
  selectReviewPage,
  setActiveTab,
  setPage,
} from '../../store/slices/reviewSlice';

const PAGE_SIZE = 10;

const TABS = [
  { key: 'received', labelKey: 'reviews.tab_received', icon: Inbox },
  { key: 'sent', labelKey: 'reviews.tab_sent', icon: Send },
];

const MyReviewsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentUserId = useSelector(state => state.user?.currentUser?._id);

  const activeTab = useSelector(selectActiveTab);
  const reviewerType = useSelector(selectReviewerTypeFilter);
  const sort = useSelector(selectReviewSort);
  const page = useSelector(selectReviewPage);

  const queryParams = useMemo(
    () => ({ ...(reviewerType && { reviewerType }), sort, page, limit: PAGE_SIZE }),
    [reviewerType, sort, page]
  );

  const {
    reviews: received,
    pagination: receivedPagination,
    isLoading: receivedLoading,
    error: receivedError,
  } = useUserReviews(currentUserId, activeTab === 'received' ? queryParams : {});

  const {
    reviews: sent,
    pagination: sentPagination,
    isLoading: sentLoading,
    error: sentError,
  } = useSentReviews(currentUserId, activeTab === 'sent' ? queryParams : {});

  const { stats, isLoading: statsLoading } = useRatingStats(currentUserId);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="w-full max-w-sm p-10 text-center bg-white border border-gray-100 rounded-2xl shadow-card">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-gray-50">
            <Star className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">{t('reviews.please_login')}</p>
        </div>
      </div>
    );
  }

  const reviews = activeTab === 'received' ? received : sent;
  const pagination = activeTab === 'received' ? receivedPagination : sentPagination;
  const isLoading = activeTab === 'received' ? receivedLoading : sentLoading;
  const error = activeTab === 'received' ? receivedError : sentError;
  const totalPages = pagination?.pages ?? 1;

  const handleTabChange = key => {
    dispatch(setActiveTab(key));
  };

  return (
    <div className="relative min-h-screen bg-background">
      <DottedBackground />

      {/* Page header */}
      <div className="relative px-6 py-5 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="mb-1 text-xs font-semibold tracking-widest uppercase text-primary">
            {t('reviews.breadcrumb')}
          </p>
          <h1 className="text-2xl font-bold text-text">{t('reviews.my_reviews_title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('reviews.my_reviews_subtitle')}</p>
        </div>
      </div>

      <div className="relative max-w-6xl px-4 py-8 mx-auto sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="space-y-4 lg:w-72 shrink-0">
            {statsLoading ? (
              <div className="flex justify-center p-6 bg-white border border-gray-100 rounded-2xl">
                <Spinner />
              </div>
            ) : (
              <RatingStatsCard stats={stats} />
            )}

            {/* How it works card */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl">
              <p className="flex items-center gap-2 mb-3 text-xs font-semibold text-text">
                <Info className="w-3.5 h-3.5 text-primary" />
                {t('reviews.how_it_works')}
              </p>
              <div className="space-y-2.5">
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-text">
                      {t('reviews.tab_received')}
                    </span>
                    <span className="text-xs leading-relaxed text-gray-400">
                      {t('reviews.received_description')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-text">
                      {t('reviews.tab_sent')}
                    </span>
                    <span className="text-xs leading-relaxed text-gray-400">
                      {t('reviews.given_description')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 mb-5 bg-white border border-gray-100 rounded-xl w-fit">
              {TABS.map(({ key, labelKey }) => {
                const count =
                  key === 'received' ? receivedPagination?.total : sentPagination?.total;
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={[
                      'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-500 hover:text-text',
                    ].join(' ')}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t(labelKey)}
                    {count != null && (
                      <span
                        className={`text-xs rounded-full px-1.5 py-0.5 ${
                          isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter bar — received tab only */}
            {activeTab === 'received' && (
              <div className="mb-5">
                <ReviewFilterBar />
              </div>
            )}

            {/* Error */}
            <AlertBanner type="error" message={error} />

            {/* Content */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={
                  activeTab === 'received' ? (
                    <Inbox className="w-8 h-8" />
                  ) : (
                    <Send className="w-8 h-8" />
                  )
                }
                title={
                  activeTab === 'received'
                    ? t('reviews.no_received_title')
                    : t('reviews.no_sent_title')
                }
                description={
                  activeTab === 'received'
                    ? t('reviews.no_received_desc')
                    : t('reviews.no_sent_desc')
                }
              />
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      currentUserId={currentUserId}
                      showActions={activeTab === 'sent'}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm transition-colors bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:border-primary/30"
                    >
                      {t('common.previous')}
                    </button>
                    <span className="text-sm text-gray-500">
                      {t('common.page_of', { current: page, total: totalPages })}
                    </span>
                    <button
                      onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm transition-colors bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:border-primary/30"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyReviewsPage;
