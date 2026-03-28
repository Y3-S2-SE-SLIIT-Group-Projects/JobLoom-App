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

  // Derive reviewerType automatically from the logged-in user's role in Redux,
  // falling back to 'job_seeker' for unauthenticated / unknown roles.
  const currentUserRole = useSelector(state => state.user?.currentUser?.role ?? 'job_seeker');
  const derivedReviewerType = currentUserRole === 'employer' ? 'employer' : 'job_seeker';

  /** Default empty form state mirrors the Review model */
  const INITIAL_FORM = {
    revieweeId: '',
    jobId: '',
    reviewerType: derivedReviewerType,
    rating: 0,
    comment: '',
    workQuality: 0,
    communication: 0,
    punctuality: 0,
    paymentOnTime: 0,
    wouldRecommend: true,
  };

  const initialValues = isEdit
    ? {
        ...INITIAL_FORM,
        revieweeId: existingReview.revieweeId?._id ?? existingReview.revieweeId ?? '',
        jobId: existingReview.jobId?._id ?? existingReview.jobId ?? '',
        reviewerType: existingReview.reviewerType ?? derivedReviewerType,
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
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  /** Add image files (max 5 total) */
  const handleImageChange = files => {
    const incoming = Array.from(files);
    setImages(prev => {
      const combined = [...prev, ...incoming].slice(0, 5);
      // Build object-URL previews for new files
      setImagePreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  };

  /** Remove image at index */
  const removeImage = index => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      setImagePreviews(next.map(f => URL.createObjectURL(f)));
      return next;
    });
  };

  const handleSubmit = async e => {
    e?.preventDefault();

    // Strip zero-rated optional criteria so the BE ignores them
    const payload = { ...form };
    ['workQuality', 'communication', 'punctuality', 'paymentOnTime'].forEach(k => {
      if (!payload[k]) delete payload[k];
    });

    // Build FormData when images are attached; plain object otherwise
    let submitPayload;
    if (images.length > 0) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach(img => fd.append('reviewImages', img));
      submitPayload = fd;
    } else {
      submitPayload = payload;
    }

    if (isEdit) {
      const result = await dispatch(
        editReview({ reviewId: existingReview._id, updateData: submitPayload })
      );
      if (!result.error) setEditSuccess(true);
    } else {
      dispatch(submitReview(submitPayload));
    }
  };

  const resetForm = () => {
    setForm(initialValues);
    setImages([]);
    setImagePreviews([]);
    setEditSuccess(false);
    dispatch(clearSubmitError());
    if (!isEdit) dispatch(clearLastSubmitted());
  };

  return {
    form,
    setField,
    handleChange,
    handleImageChange,
    removeImage,
    images,
    imagePreviews,
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
