import { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * ConfirmModal
 * Reusable confirm / prompt dialog — replaces window.confirm and window.prompt.
 *
 * Props:
 *   isOpen      {boolean}  – controls visibility
 *   title       {string}   – modal heading
 *   message     {string}   – body text
 *   confirmLabel {string}  – confirm button text (default "Confirm")
 *   confirmVariant {string} – "danger" | "primary" (default "danger")
 *   withInput   {boolean}  – shows a textarea for user to type a reason
 *   inputLabel  {string}   – label above the textarea
 *   inputPlaceholder {string}
 *   onConfirm   {Function} – called with input value (or true if no input)
 *   onCancel    {Function} – called when dismissed
 */
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  withInput = false,
  inputLabel = 'Reason',
  inputPlaceholder = 'Enter reason…',
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Reset input and focus when modal opens.
  // Both calls are inside setTimeout so setState is not synchronous in the effect body.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      setInputValue('');
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onCancel?.();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (withInput && !inputValue.trim()) return;
    onConfirm?.(withInput ? inputValue.trim() : true);
    setInputValue('');
  };

  const confirmClasses =
    confirmVariant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-[#6794D1] hover:opacity-90 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes />
        </button>

        <h3 className="text-base font-bold text-[#2B373F] mb-2 pr-6">{title}</h3>
        {message && <p className="text-sm text-gray-500 mb-4 leading-relaxed">{message}</p>}

        {withInput && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {inputLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={inputRef}
              rows={3}
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-[#6794D1]"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={withInput && !inputValue.trim()}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
