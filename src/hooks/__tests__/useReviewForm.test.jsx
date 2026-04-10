import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useReviewForm from '../useReviewForm';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => mockUseSelector(selector),
}));

const mockSubmitReview = vi.fn();
const mockEditReview = vi.fn();
const mockClearSubmitError = vi.fn();
const mockClearLastSubmitted = vi.fn();

vi.mock('../../store/slices/reviewSlice', () => ({
  submitReview: (...args) => mockSubmitReview(...args),
  editReview: (...args) => mockEditReview(...args),
  clearSubmitError: (...args) => mockClearSubmitError(...args),
  clearLastSubmitted: (...args) => mockClearLastSubmitted(...args),
  selectReviewLoading: key => state => state.reviews.loading[key],
  selectReviewError: key => state => state.reviews.error[key],
  selectLastSubmittedReview: state => state.reviews.lastSubmittedReview,
}));

describe('useReviewForm', () => {
  const state = {
    user: { currentUser: { _id: 'u1', role: 'employer' } },
    reviews: {
      loading: { submit: false, edit: false },
      error: { submit: null, edit: null },
      lastSubmittedReview: { _id: 'r1' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(selector => selector(state));
    mockDispatch.mockImplementation(action => action);
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('derives employer reviewer type and auto-calculates rating on submit', async () => {
    mockSubmitReview.mockReturnValue({ type: 'reviews/submitReview' });

    const { result } = renderHook(() => useReviewForm({ revieweeId: 'u2', jobId: 'j1' }));

    act(() => {
      result.current.setField('workQuality', 4);
      result.current.setField('communication', 5);
      result.current.setField('punctuality', 3);
      result.current.setField('comment', 'Great work');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockSubmitReview).toHaveBeenCalledTimes(1);
    const payload = mockSubmitReview.mock.calls[0][0];
    expect(payload.reviewerType).toBe('employer');
    expect(payload.rating).toBe(4);
    expect(payload.comment).toBe('Great work');
    expect(payload.paymentOnTime).toBeUndefined();
  });

  it('supports image add/remove and preview generation', () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });

    const { result } = renderHook(() => useReviewForm({ revieweeId: 'u2', jobId: 'j1' }));

    act(() => {
      result.current.handleImageChange([fileA, fileB]);
    });

    expect(result.current.images).toHaveLength(2);
    expect(result.current.imagePreviews).toHaveLength(2);

    act(() => {
      result.current.removeImage(0);
    });

    expect(result.current.images).toHaveLength(1);
  });

  it('handles edit mode success and exposes submittedReview from existing review', async () => {
    const existingReview = {
      _id: 'rev-99',
      revieweeId: 'u2',
      jobId: 'j1',
      reviewerType: 'employer',
    };
    mockEditReview.mockReturnValue({ type: 'reviews/editReview' });
    mockDispatch.mockImplementation(action => {
      if (action.type === 'reviews/editReview') return Promise.resolve({ error: null });
      return action;
    });

    const { result } = renderHook(() => useReviewForm({}, existingReview));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockEditReview).toHaveBeenCalledTimes(1);
    expect(result.current.isEdit).toBe(true);
    expect(result.current.editSuccess).toBe(true);
    expect(result.current.submittedReview).toEqual(existingReview);
  });

  it('resetForm clears submit errors and last submitted for create mode', () => {
    mockClearSubmitError.mockReturnValue({ type: 'reviews/clearSubmitError' });
    mockClearLastSubmitted.mockReturnValue({ type: 'reviews/clearLastSubmitted' });

    const { result } = renderHook(() => useReviewForm({ revieweeId: 'u2', jobId: 'j1' }));

    act(() => {
      result.current.setField('comment', 'temp');
      result.current.resetForm();
    });

    expect(result.current.form.comment).toBe('');
    expect(mockClearSubmitError).toHaveBeenCalledWith();
    expect(mockClearLastSubmitted).toHaveBeenCalledWith();
  });
});
