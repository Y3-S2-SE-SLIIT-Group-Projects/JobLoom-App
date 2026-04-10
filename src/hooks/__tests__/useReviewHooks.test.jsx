import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useJobReviews from '../useJobReviews';
import useUserReviews from '../useUserReviews';
import useSentReviews from '../useSentReviews';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => mockUseSelector(selector),
}));

const mockLoadJobReviews = vi.fn();
const mockLoadUserReviews = vi.fn();
const mockLoadSentReviews = vi.fn();

vi.mock('../../store/slices/reviewSlice', () => ({
  loadJobReviews: (...args) => mockLoadJobReviews(...args),
  loadUserReviews: (...args) => mockLoadUserReviews(...args),
  loadSentReviews: (...args) => mockLoadSentReviews(...args),
  selectJobReviews: state => state.reviews.jobReviews,
  selectUserReviews: state => state.reviews.userReviews,
  selectSentReviews: state => state.reviews.sentReviews,
  selectReviewPagination: state => state.reviews.pagination,
  selectSentReviewPagination: state => state.reviews.sentPagination,
  selectReviewLoading: key => state => state.reviews.loading[key],
  selectReviewError: key => state => state.reviews.error[key],
}));

describe('review data hooks', () => {
  const state = {
    reviews: {
      jobReviews: [{ _id: 'jr1' }],
      userReviews: [{ _id: 'ur1' }],
      sentReviews: [{ _id: 'sr1' }],
      pagination: { page: 1, pages: 2, total: 15 },
      sentPagination: { page: 1, pages: 1, total: 3 },
      loading: { jobReviews: false, userReviews: false, sentReviews: false },
      error: { jobReviews: null, userReviews: null, sentReviews: null },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(selector => selector(state));
    mockDispatch.mockImplementation(action => action);
  });

  it('useJobReviews dispatches fetch on mount and exposes state', () => {
    mockLoadJobReviews.mockReturnValue({ type: 'reviews/loadJobReviews' });

    const { result } = renderHook(() => useJobReviews('job-1'));

    expect(mockLoadJobReviews).toHaveBeenCalledWith('job-1');
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'reviews/loadJobReviews' });
    expect(result.current.reviews).toEqual([{ _id: 'jr1' }]);
  });

  it('useJobReviews refetch does nothing when no jobId', () => {
    const { result } = renderHook(() => useJobReviews(''));

    result.current.refetch();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('useUserReviews dispatches with userId and params', () => {
    mockLoadUserReviews.mockReturnValue({ type: 'reviews/loadUserReviews' });

    const params = { page: 2, limit: 10, sort: '-createdAt' };
    const { result } = renderHook(() => useUserReviews('user-1', params));

    expect(mockLoadUserReviews).toHaveBeenCalledWith({ userId: 'user-1', params });
    expect(result.current.reviews).toEqual([{ _id: 'ur1' }]);
    expect(result.current.pagination).toEqual({ page: 1, pages: 2, total: 15 });
  });

  it('useSentReviews dispatches with userId and params', () => {
    mockLoadSentReviews.mockReturnValue({ type: 'reviews/loadSentReviews' });

    const params = { page: 1, limit: 5 };
    const { result } = renderHook(() => useSentReviews('user-1', params));

    expect(mockLoadSentReviews).toHaveBeenCalledWith({ userId: 'user-1', params });
    expect(result.current.reviews).toEqual([{ _id: 'sr1' }]);
    expect(result.current.pagination).toEqual({ page: 1, pages: 1, total: 3 });
  });
});
