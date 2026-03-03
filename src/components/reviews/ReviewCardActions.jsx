import { FaEdit, FaFlag, FaTrash } from 'react-icons/fa';

/**
 * ReviewCardActions
 * Edit (owner), Delete (owner) and Report (others) action buttons.
 *
 * @param {boolean}  isOwner     – whether the current user wrote this review
 * @param {boolean}  isDeleting  – loading state for delete
 * @param {boolean}  isReporting – loading state for report
 * @param {Function} onEdit      – edit handler (owner)
 * @param {Function} onDelete    – delete handler (owner)
 * @param {Function} onReport    – report handler (others)
 */
const ReviewCardActions = ({ isOwner, isDeleting, isReporting, onEdit, onDelete, onReport }) => (
  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
    {isOwner && (
      <>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-[#6794D1] hover:text-[#4a7bbf] transition-colors"
        >
          <FaEdit className="text-xs" />
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          <FaTrash className="text-xs" />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </>
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
