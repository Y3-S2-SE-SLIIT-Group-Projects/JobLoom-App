import { useState, useMemo } from 'react';
import { FaStar, FaPen, FaInbox, FaPaperPlane } from 'react-icons/fa';
import useUserReviews from '../../hooks/useUserReviews';
import useSentReviews from '../../hooks/useSentReviews';
import { getCurrentUserId } from '../../store/slices/reviewSlice';
import ReviewCard from '../../components/reviews/ReviewCard';
import ReviewFilterBar from '../../components/reviews/ReviewFilterBar';
import RatingStatsCard from '../../components/reviews/RatingStatsCard';
import useRatingStats from '../../hooks/useRatingStats';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import AlertBanner from '../../components/ui/AlertBanner';
import DottedBackground from '../../components/DottedBackground';

const PAGE_SIZE = 10;

const TABS = [
  { key: 'received', label: 'Received', icon: <FaInbox /> },
  { key: 'sent', label: 'Sent', icon: <FaPaperPlane /> },
];

/**
 * MyReviewsPage  –  /reviews/my
 * Shows the logged-in user's received and sent reviews.
 *
 * Received tab: reviews others wrote about you (editable by them).
 * Sent tab:     reviews you wrote about others (you can edit + delete).
 *
 * Uses the JWT in localStorage to resolve the current user's ID.
 * Once an auth slice is added, swap getCurrentUserId() for a Redux selector.
 */
const MyReviewsPage = () => {
  const currentUserId = getCurrentUserId();

  const [activeTab, setActiveTab] = useState('received');
  const [reviewerType, setReviewerType] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ ...(reviewerType && { reviewerType }), sort, page, limit: PAGE_SIZE }),
    [reviewerType, sort, page]
  );

  const {
    reviews: receivedReviews,
    pagination: receivedPagination,
    isLoading: receivedLoading,
    error: receivedError,
  } = useUserReviews(currentUserId, activeTab === 'received' ? queryParams : {});

  const {
    reviews: sentReviews,
    pagination: sentPagination,
    isLoading: sentLoading,
    error: sentError,
  } = useSentReviews(currentUserId, activeTab === 'sent' ? queryParams : {});

  const { stats, isLoading: statsLoading } = useRatingStats(currentUserId);

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center">
          <FaStar className="text-5xl text-neutral-300 mx-auto mb-3" />
          <p className="text-subtle font-medium">Please log in to view your reviews.</p>
        </div>
      </div>
    );
  }

  const reviews = activeTab === 'received' ? receivedReviews : sentReviews;
  const pagination = activeTab === 'received' ? receivedPagination : sentPagination;
  const isLoading = activeTab === 'received' ? receivedLoading : sentLoading;
  const error = activeTab === 'received' ? receivedError : sentError;
  const totalPages = pagination?.pages ?? 1;

  const handleTabChange = tab => {
    setActiveTab(tab);
    setReviewerType('');
    setSort('-createdAt');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-muted relative">
      <DottedBackground />

      {/* Page header */}
      <div className="relative bg-surface border-b border-border px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
            Profile
          </p>
          <h1 className="text-2xl font-bold text-text-dark">My Reviews</h1>
          <p className="text-sm text-subtle mt-0.5">
            Reviews you have received and reviews you have written.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="lg:w-72 shrink-0 space-y-4">
            {statsLoading ? (
              <div className="bg-surface rounded-xl border border-border p-6 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <RatingStatsCard stats={stats} />
            )}

            {/* Quick legend */}
            <div className="bg-surface rounded-xl border border-border p-4 text-xs text-subtle space-y-2">
              <p className="font-semibold text-muted">How it works</p>
              <p>
                <span className="font-medium text-text-dark">Received</span> — reviews others wrote
                about you after a completed job.
              </p>
              <p>
                <span className="font-medium text-text-dark">Sent</span> — reviews you wrote. You
                can edit within 7 days or delete at any time.
              </p>
            </div>
          </aside>

          {/* ── Main ────────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-5 w-fit">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-subtle hover:text-text-dark'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === 'received' && receivedPagination?.total != null && (
                    <span
                      className={`text-xs rounded-full px-1.5 py-0.5 ${
                        activeTab === 'received' ? 'bg-surface/25' : 'bg-neutral-100 text-subtle'
                      }`}
                    >
                      {receivedPagination.total}
                    </span>
                  )}
                  {tab.key === 'sent' && sentPagination?.total != null && (
                    <span
                      className={`text-xs rounded-full px-1.5 py-0.5 ${
                        activeTab === 'sent' ? 'bg-surface/25' : 'bg-neutral-100 text-subtle'
                      }`}
                    >
                      {sentPagination.total}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter bar — only on received */}
            {activeTab === 'received' && (
              <ReviewFilterBar
                reviewerType={reviewerType}
                sort={sort}
                onFilterChange={v => {
                  setReviewerType(v);
                  setPage(1);
                }}
                onSortChange={v => {
                  setSort(v);
                  setPage(1);
                }}
              />
            )}

            {/* Content */}
            <AlertBanner type="error" message={error} />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={
                  activeTab === 'received' ? (
                    <FaInbox className="text-4xl" />
                  ) : (
                    <FaPaperPlane className="text-4xl" />
                  )
                }
                title={activeTab === 'received' ? 'No reviews received yet' : 'No reviews sent yet'}
                description={
                  activeTab === 'received'
                    ? 'Reviews will appear here when others rate you after a completed job.'
                    : 'Reviews you write about employers or job seekers will appear here.'
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm bg-surface border border-border rounded-lg disabled:opacity-40 hover:border-primary transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-subtle">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm bg-surface border border-border rounded-lg disabled:opacity-40 hover:border-primary transition-colors"
                    >
                      Next
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
