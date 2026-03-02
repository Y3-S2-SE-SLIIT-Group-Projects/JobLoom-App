import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitReview,
  clearSubmitError,
  clearLastSubmitted,
  selectReviewLoading,
  selectReviewError,
  selectLastSubmittedReview,
} from '../store/slices/reviewSlice';

/** Default empty form state mirrors the Review model */
const INITIAL_FORM = {
  revieweeId: '',
  jobId: '',
  reviewerType: 'job_seeker', // 'job_seeker' | 'employer'
  rating: 0,
  comment: '',
  workQuality: 0,
  communication: 0,
  punctuality: 0,
  paymentOnTime: 0,
  wouldRecommend: true,
};

/**
 * useReviewForm
 * Manages form state and submission for creating a new review.
 *
 * @param {Object} defaults - Pre-filled values (e.g. jobId, revieweeId from route params)
 */
const useReviewForm = (defaults = {}) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({ ...INITIAL_FORM, ...defaults });

  const isSubmitting = useSelector(selectReviewLoading('submit'));
  const submitError = useSelector(selectReviewError('submit'));
  const submittedReview = useSelector(selectLastSubmittedReview);

  /** Update a single field */
  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  /** Full form change from an input event */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  };

  const handleSubmit = e => {
    e?.preventDefault();

    // Strip zero-rated optional criteria so the BE ignores them
    const payload = { ...form };
    ['workQuality', 'communication', 'punctuality', 'paymentOnTime'].forEach(k => {
      if (!payload[k]) delete payload[k];
    });

    dispatch(submitReview(payload));
  };

  const resetForm = () => {
    setForm({ ...INITIAL_FORM, ...defaults });
    dispatch(clearSubmitError());
    dispatch(clearLastSubmitted());
  };

  return {
    form,
    setField,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedReview,
  };
};

export default useReviewForm;
