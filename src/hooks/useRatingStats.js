import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadRatingStats,
  selectRatingStats,
  selectReviewLoading,
  selectReviewError,
} from '../store/slices/reviewSlice';

/**
 * useRatingStats
 * Fetches and exposes rating statistics for a given user.
 *
 * @param {string} userId
 */
const useRatingStats = userId => {
  const dispatch = useDispatch();

  const stats = useSelector(selectRatingStats);
  const isLoading = useSelector(selectReviewLoading('ratingStats'));
  const error = useSelector(selectReviewError('ratingStats'));

  useEffect(() => {
    if (!userId) return;
    dispatch(loadRatingStats(userId));
  }, [dispatch, userId]);

  return { stats, isLoading, error };
};

export default useRatingStats;
