import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes, FaCheckCircle, FaPaperPlane, FaFileAlt, FaLink } from 'react-icons/fa';
import useApplyForm from '../../hooks/useApplyForm';
import AlertBanner from '../ui/AlertBanner';
import Spinner from '../ui/Spinner';

/**
 * ApplyModal
 * Overlay modal for job seekers to apply for a job.
 *
 * Props:
 *   isOpen     {boolean}  – show/hide
 *   onClose    {Function} – called on cancel or after success
 *   jobId      {string}   – the job being applied to
 *   jobTitle   {string}   – displayed in the header
 *   onSuccess  {Function} – optional callback after successful submission
 */
const ApplyModal = ({ isOpen, onClose, jobId, jobTitle = '', onSuccess }) => {
  const {
    form,
    setField,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedApplication,
  } = useApplyForm({ jobId });

  const userCvs = useSelector(state => state.user.currentUser?.cvs) || [];
  const hasCvs = userCvs.length > 0;

  const succeeded = Boolean(submittedApplication);

  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(() => {
      onSuccess?.();
      onClose?.();
      resetForm();
    }, 1400);
    return () => clearTimeout(t);
  }, [succeeded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose?.();
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !isSubmitting) handleClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  // ── Success State ─────────────────────────────────────────────────────────
  if (succeeded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-2xl">
          <FaCheckCircle className="mx-auto mb-3 text-5xl text-green-500" />
          <p className="text-lg font-bold text-[#2B373F]">Application submitted!</p>
          <p className="mt-1 text-sm text-gray-500">
            Your application for <span className="font-medium text-gray-700">{jobTitle}</span> has
            been sent to the employer.
          </p>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
              Apply for Job
            </p>
            <h2 className="text-base font-bold text-[#2B373F] leading-tight">
              {jobTitle || 'Job Application'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          <form id="apply-modal-form" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <AlertBanner type="error" message={submitError} />

              {/* Cover Letter */}
              <div>
                <label
                  className="block mb-1 text-sm font-semibold text-gray-700"
                  htmlFor="apply-coverLetter"
                >
                  Cover Letter <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="apply-coverLetter"
                  name="coverLetter"
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell the employer why you're a great fit for this role…"
                  value={form.coverLetter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-[#6794D1]"
                />
                <p className="mt-1 text-xs text-right text-gray-400">
                  {form.coverLetter.length}/1000
                </p>
              </div>

              {/* CV / Resume Selection */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Resume / CV <span className="font-normal text-gray-400">(optional)</span>
                </label>

                {hasCvs && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Select from your uploaded CVs
                    </p>
                    {userCvs.map(cv => (
                      <label
                        key={cv._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          form.selectedCvId === cv._id
                            ? 'border-[#2CD2BD] bg-[#2CD2BD]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cvSelection"
                          value={cv._id}
                          checked={form.selectedCvId === cv._id}
                          onChange={() => {
                            setField('selectedCvId', cv._id);
                            setField('resumeUrl', '');
                          }}
                          className="accent-[#2CD2BD]"
                        />
                        <FaFileAlt className="w-4 h-4 text-[#6794D1] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{cv.name}</p>
                          <p className="text-xs text-gray-400">
                            Uploaded {new Date(cv.createdAt).toLocaleDateString()}
                            {cv.isPrimary && (
                              <span className="ml-2 text-[#2CD2BD] font-medium">Primary</span>
                            )}
                          </p>
                        </div>
                      </label>
                    ))}

                    {form.selectedCvId && (
                      <button
                        type="button"
                        onClick={() => setField('selectedCvId', '')}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                )}

                {hasCvs && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or paste a link</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <div className="relative">
                  <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    id="apply-resumeUrl"
                    name="resumeUrl"
                    type="url"
                    placeholder="https://drive.google.com/…"
                    value={form.resumeUrl}
                    onChange={e => {
                      handleChange(e);
                      if (e.target.value) setField('selectedCvId', '');
                    }}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#6794D1]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {hasCvs
                    ? 'Or paste an external link (Google Drive, Dropbox, etc.)'
                    : 'Paste a link to your resume (Google Drive, Dropbox, etc.)'}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-[#6794D1] transition-colors"
          >
            Cancel
          </button>
          <button
            form="apply-modal-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#2CD2BD] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" /> : <FaPaperPlane className="text-xs" />}
            {isSubmitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
