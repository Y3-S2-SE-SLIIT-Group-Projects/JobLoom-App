import { FaEdit, FaFlag, FaTrash } from 'react-icons/fa';

/**
 * ReviewCardActions
 * Edit (owner + canEdit), Delete (owner + canDelete) and Report (others) action buttons.
 *
 * @param {boolean}  isOwner     – whether the current user wrote this review
 * @param {boolean}  canEdit     – whether the review is still within its edit window (from BE)
 * @param {boolean}  canDelete   – whether the review is still within its delete window (from BE)
 * @param {boolean}  isDeleting  – loading state for delete
 * @param {boolean}  isReporting – loading state for report
 * @param {Function} onEdit      – edit handler (owner)
 * @param {Function} onDelete    – delete handler (owner)
 * @param {Function} onReport    – report handler (others)
 */
const ReviewCardActions = ({
  isOwner,
  canEdit,
  canDelete,
  isDeleting,
  isReporting,
  onEdit,
  onDelete,
  onReport,
}) => {
  const showEdit = isOwner && canEdit;
  const showDelete = isOwner && canDelete;
  const showReport = !isOwner;

  if (!showEdit && !showDelete && !showReport) return null;

  return (
    <div className="flex gap-3 mt-4 pt-3 border-t border-neutral-100">
      {showEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-primary hover:text-deep-blue transition-colors"
        >
          <FaEdit className="text-xs" />
          Edit
        </button>
      )}
      {showDelete && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 text-xs text-error hover:text-error transition-colors disabled:opacity-50"
        >
          <FaTrash className="text-xs" />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      )}
      {showReport && (
        <button
          onClick={onReport}
          disabled={isReporting}
          className="flex items-center gap-1 text-xs text-subtle hover:text-error transition-colors disabled:opacity-50"
        >
          <FaFlag className="text-xs" />
          {isReporting ? 'Reporting…' : 'Report'}
        </button>
      )}
    </div>
  );
};

export default ReviewCardActions;
