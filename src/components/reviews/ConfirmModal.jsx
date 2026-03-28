import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  withInput = false,
  inputLabel,
  inputPlaceholder,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      setValue('');
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onCancel?.();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (withInput && !value.trim()) return;
    onConfirm?.(withInput ? value.trim() : true);
    setValue('');
  };

  const isDanger = confirmVariant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 overflow-hidden">
        <div className={`h-1 w-full ${isDanger ? 'bg-red-500' : 'bg-primary'}`} />

        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-50' : 'bg-primary/10'}`}>
              <AlertTriangle className={`w-4 h-4 ${isDanger ? 'text-red-500' : 'text-primary'}`} />
            </div>
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-bold text-text">{title}</h3>
              {message && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>}
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {withInput && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {inputLabel || t('reviews.report_reason_label')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={inputRef}
                rows={3}
                placeholder={inputPlaceholder}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={withInput && !value.trim()}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDanger
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {confirmLabel || t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
