import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitReview,
  editReview,
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
 * Manages form state + submission for creating OR editing a review.
 *
 * @param {Object} defaults     - Pre-filled values (jobId, revieweeId from route/props)
 * @param {Object} [existingReview] - When provided, switches to edit mode
 */
const useReviewForm = (defaults = {}, existingReview = null) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(existingReview);

  const initialValues = isEdit
    ? {
        ...INITIAL_FORM,
        revieweeId: existingReview.revieweeId?._id ?? existingReview.revieweeId ?? '',
        jobId: existingReview.jobId?._id ?? existingReview.jobId ?? '',
        reviewerType: existingReview.reviewerType ?? 'job_seeker',
        rating: existingReview.rating ?? 0,
        comment: existingReview.comment ?? '',
        workQuality: existingReview.workQuality ?? 0,
        communication: existingReview.communication ?? 0,
        punctuality: existingReview.punctuality ?? 0,
        paymentOnTime: existingReview.paymentOnTime ?? 0,
        wouldRecommend: existingReview.wouldRecommend ?? true,
      }
    : { ...INITIAL_FORM, ...defaults };

  const [form, setForm] = useState(initialValues);
  const [editSuccess, setEditSuccess] = useState(false);

  const isSubmitting = useSelector(selectReviewLoading(isEdit ? 'edit' : 'submit'));
  const submitError = useSelector(selectReviewError(isEdit ? 'edit' : 'submit'));
  const submittedReview = useSelector(selectLastSubmittedReview);

  /** Update a single field */
  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  /** Full form change from an input event */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  };

  const handleSubmit = async e => {
    e?.preventDefault();

    // Strip zero-rated optional criteria so the BE ignores them
    const payload = { ...form };
    ['workQuality', 'communication', 'punctuality', 'paymentOnTime'].forEach(k => {
      if (!payload[k]) delete payload[k];
    });

    if (isEdit) {
      const result = await dispatch(
        editReview({ reviewId: existingReview._id, updateData: payload })
      );
      if (!result.error) setEditSuccess(true);
    } else {
      dispatch(submitReview(payload));
    }
  };

  const resetForm = () => {
    setForm(initialValues);
    setEditSuccess(false);
    dispatch(clearSubmitError());
    if (!isEdit) dispatch(clearLastSubmitted());
  };

  return {
    form,
    setField,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedReview: isEdit ? (editSuccess ? existingReview : null) : submittedReview,
    editSuccess,
    isEdit,
  };
};

export default useReviewForm;
