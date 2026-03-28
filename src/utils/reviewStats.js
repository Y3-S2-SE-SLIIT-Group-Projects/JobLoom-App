export const deriveStatsFromReviews = (reviews = []) => {
  const numericRatings = reviews
    .map(review => Number(review?.rating))
    .filter(rating => Number.isFinite(rating) && rating >= 1 && rating <= 5);

  if (numericRatings.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalReviews = numericRatings.length;
  const averageRating =
    Math.round((numericRatings.reduce((sum, value) => sum + value, 0) / totalReviews) * 10) / 10;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  numericRatings.forEach(rating => {
    const bucket = Math.max(1, Math.min(5, Math.round(rating)));
    ratingDistribution[bucket] += 1;
  });

  return { averageRating, totalReviews, ratingDistribution };
};
