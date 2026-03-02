import { FaFlag } from 'react-icons/fa';

/**
 * ReviewCardActions
 * Delete (owner) and Report (others) action buttons shown at the bottom of a ReviewCard.
 *
 * @param {boolean}  isOwner     - Whether the current user wrote this review
 * @param {boolean}  isDeleting  - Loading state for delete
 * @param {boolean}  isReporting - Loading state for report
 * @param {Function} onDelete    - Delete handler
 * @param {Function} onReport    - Report handler
 */
const ReviewCardActions = ({ isOwner, isDeleting, isReporting, onDelete, onReport }) => (
  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
    {isOwner && (
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      >
        {isDeleting ? 'Deleting…' : 'Delete'}
      </button>
    )}
    {!isOwner && (
      <button
        onClick={onReport}
        disabled={isReporting}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <FaFlag className="text-xs" />
        {isReporting ? 'Reporting…' : 'Report'}
      </button>
    )}
  </div>
);

export default ReviewCardActions;
