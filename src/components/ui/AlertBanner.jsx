/**
 * AlertBanner
 * Inline alert for error or success messages.
 *
 * @param {string} type     - 'error' | 'success' | 'info'
 * @param {string} message  - Message text
 * @param {Function} onDismiss - Optional dismiss handler
 */
const TYPE_CLASSES = {
  error: 'bg-error/10 border-error text-error',
  success: 'bg-success/10 border-success/30 text-success',
  info: 'bg-info/10 border-info/30 text-info',
};

const AlertBanner = ({ type = 'info', message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between gap-2 border rounded-lg px-4 py-3 text-sm ${TYPE_CLASSES[type]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 font-bold text-lg leading-none opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
