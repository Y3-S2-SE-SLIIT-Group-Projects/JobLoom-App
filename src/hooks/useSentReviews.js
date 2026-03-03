import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadSentReviews,
  selectSentReviews,
  selectSentReviewPagination,
  selectReviewLoading,
  selectReviewError,
} from '../store/slices/reviewSlice';

/**
 * useSentReviews
 * Fetches reviews that a user has WRITTEN (they are the reviewer).
 *
 * @param {string} userId
 * @param {Object} params - { page, limit, sort }
 */
const useSentReviews = (userId, params = {}) => {
  const dispatch = useDispatch();

  const reviews = useSelector(selectSentReviews);
  const pagination = useSelector(selectSentReviewPagination);
  const isLoading = useSelector(selectReviewLoading('sentReviews'));
  const error = useSelector(selectReviewError('sentReviews'));

  useEffect(() => {
    if (!userId) return;
    dispatch(loadSentReviews({ userId, params }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId, JSON.stringify(params)]);

  return { reviews, pagination, isLoading, error };
};

export default useSentReviews;
