import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import StarRating from '../ui/StarRating';
import RatingBar from '../ui/RatingBar';
import { deriveStatsFromReviews } from '../../utils/reviewStats';

const RatingStatsCard = ({ stats, reviews = [] }) => {
  const { t } = useTranslation();

  const derived = deriveStatsFromReviews(reviews);
  const hasDerivedData = derived.totalReviews > 0;
  const hasReliableStats = (stats?.totalReviews ?? 0) > 0;

  const safeStats = hasReliableStats ? stats : hasDerivedData ? derived : stats;

  if (!safeStats) return null;

  const distribution = safeStats.ratingDistribution ?? {};
  const avg = (safeStats.averageRating ?? 0).toFixed(1);
  const total = safeStats.totalReviews ?? 0;
  const countLabel =
    total === 1
      ? t('reviews.review_count', { count: total })
      : t('reviews.review_count_plural', { count: total });

  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl">
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <h3 className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          {t('reviews.rating_summary')}
        </h3>

        <div className="flex items-center gap-4">
          <span className="text-5xl font-bold text-text tabular-nums">{avg}</span>
          <div>
            <StarRating value={safeStats.averageRating ?? 0} size="text-lg" />
            <p className="mt-1 text-xs text-gray-400">{countLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        {[5, 4, 3, 2, 1].map(star => (
          <RatingBar key={star} star={star} count={distribution[star] ?? 0} total={total} />
        ))}
      </div>
    </div>
  );
};

export default RatingStatsCard;
