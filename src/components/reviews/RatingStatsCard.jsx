import StarRating from '../ui/StarRating';
import RatingBar from '../ui/RatingBar';

/**
 * RatingStatsCard
 * Shows aggregate rating summary: average, total, and distribution.
 *
 * @param {Object} stats  - ratingStats from Redux state
 *   { averageRating, totalReviews, ratingDistribution: { 5,4,3,2,1 } }
 */
const RatingStatsCard = ({ stats }) => {
  if (!stats) return null;

  const distribution = stats.ratingDistribution ?? {};
  const bars = [5, 4, 3, 2, 1];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Rating Summary
      </h3>

      {/* Big average */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl font-bold text-[#2B373F]">
          {(stats.averageRating ?? 0).toFixed(1)}
        </span>
        <div>
          <StarRating value={stats.averageRating ?? 0} size="text-xl" />
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalReviews ?? 0} review{stats.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-1.5">
        {bars.map(star => (
          <RatingBar
            key={star}
            star={star}
            count={distribution[star] ?? 0}
            total={stats.totalReviews ?? 0}
          />
        ))}
      </div>
    </div>
  );
};

export default RatingStatsCard;
