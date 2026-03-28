import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import useUserReviews from '../../hooks/useUserReviews';
import useRatingStats from '../../hooks/useRatingStats';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingStatsCard from '../../components/reviews/RatingStatsCard';
import ReviewFilterBar from '../../components/reviews/ReviewFilterBar';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import AlertBanner from '../../components/ui/AlertBanner';

const PAGE_SIZE = 10;

/**
 * UserReviewsPage  –  /reviews/:userId
 * Displays all reviews received by a user, with rating stats in a sidebar.
 */
const UserReviewsPage = () => {
  const { userId } = useParams();
  const currentUserId = useSelector(state => state.user?.currentUser?._id);
  const isOwnProfile = currentUserId === userId;

  const [reviewerType, setReviewerType] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const queryParams = {
    ...(reviewerType && { reviewerType }),
    sort,
    page,
    limit: PAGE_SIZE,
  };

  const { reviews, pagination, isLoading, error } = useUserReviews(userId, queryParams);
  const { stats, isLoading: statsLoading } = useRatingStats(userId);

  const handleFilterChange = value => {
    setReviewerType(value);
    setPage(1);
  };

  const handleSortChange = value => {
    setSort(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Page header */}
      <div className="bg-surface border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/jobs"
            className="p-2 rounded-lg text-subtle hover:text-primary hover:bg-info/10 transition-colors"
            aria-label="Back"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-dark">User Reviews</h1>
            <p className="text-sm text-subtle">Reviews and ratings received by this user</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar – Rating Stats */}
          <aside className="w-full lg:w-72 shrink-0">
            {statsLoading ? <Spinner className="py-8" /> : <RatingStatsCard stats={stats} />}

            {/* Quick link to submit a review – hidden when viewing own profile */}
            {!isOwnProfile && currentUserId && (
              <div className="mt-4">
                <Link
                  to={`/reviews/submit?revieweeId=${userId}`}
                  className="block w-full text-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Write a Review
                </Link>
              </div>
            )}
          </aside>

          {/* Main content */}
          <section className="flex-1 min-w-0">
            {/* Filter bar */}
            <ReviewFilterBar
              reviewerType={reviewerType}
              onFilterChange={handleFilterChange}
              sort={sort}
              onSortChange={handleSortChange}
            />

            <div className="mt-5">
              {error && <AlertBanner type="error" message={error} className="mb-4" />}

              {isLoading ? (
                <Spinner size="lg" className="py-16" />
              ) : reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  message="This user has not received any reviews matching the current filter."
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

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-surface-muted transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-muted">
                        {page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-surface-muted transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserReviewsPage;
