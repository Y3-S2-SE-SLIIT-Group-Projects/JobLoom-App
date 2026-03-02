import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadUserReviews,
  selectUserReviews,
  selectReviewPagination,
  selectReviewLoading,
  selectReviewError,
} from '../store/slices/reviewSlice';

/**
 * useUserReviews
 * Fetches and exposes reviews for a given user with filter/sort/pagination support.
 *
 * @param {string} userId
 * @param {Object} params - { reviewerType, page, limit, sort }
 */
const useUserReviews = (userId, params = {}) => {
  const dispatch = useDispatch();

  const reviews = useSelector(selectUserReviews);
  const pagination = useSelector(selectReviewPagination);
  const isLoading = useSelector(selectReviewLoading('userReviews'));
  const error = useSelector(selectReviewError('userReviews'));

  useEffect(() => {
    if (!userId) return;
    dispatch(loadUserReviews({ userId, params }));
    // `params` is an object — stringify to stabilise the dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId, JSON.stringify(params)]);

  return { reviews, pagination, isLoading, error };
};

export default useUserReviews;
