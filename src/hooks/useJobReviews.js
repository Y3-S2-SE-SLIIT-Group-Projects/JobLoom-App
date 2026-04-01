import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadJobReviews,
  selectJobReviews,
  selectReviewLoading,
  selectReviewError,
} from '../store/slices/reviewSlice';

/**
 * useJobReviews
 * Fetches and exposes reviews for a specific job.
 *
 * @param {string} jobId
 */
const useJobReviews = jobId => {
  const dispatch = useDispatch();

  const reviews = useSelector(selectJobReviews);
  const isLoading = useSelector(selectReviewLoading('jobReviews'));
  const error = useSelector(selectReviewError('jobReviews'));

  const refetch = useCallback(() => {
    if (!jobId) return;
    dispatch(loadJobReviews(jobId));
  }, [dispatch, jobId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reviews, isLoading, error, refetch };
};

export default useJobReviews;
