import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitApplication,
  clearSubmitError,
  clearLastSubmitted,
  selectApplicationLoading,
  selectApplicationError,
  selectLastSubmittedApplication,
} from '../store/slices/applicationSlice';

const INITIAL_FORM = {
  jobId: '',
  coverLetter: '',
  resumeUrl: '',
};

/**
 * useApplyForm
 * Manages form state + Redux submission for applying to a job.
 *
 * @param {Object} defaults - Pre-filled values (e.g. { jobId })
 */
const useApplyForm = (defaults = {}) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ ...INITIAL_FORM, ...defaults });

  const isSubmitting = useSelector(selectApplicationLoading('submit'));
  const submitError = useSelector(selectApplicationError('submit'));
  const submittedApplication = useSelector(selectLastSubmittedApplication);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleChange = e => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const handleSubmit = async e => {
    e?.preventDefault();

    const payload = { jobId: form.jobId };
    if (form.coverLetter.trim()) payload.coverLetter = form.coverLetter.trim();
    if (form.resumeUrl.trim()) payload.resumeUrl = form.resumeUrl.trim();

    return dispatch(submitApplication(payload));
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
    submittedApplication,
  };
};

export default useApplyForm;
