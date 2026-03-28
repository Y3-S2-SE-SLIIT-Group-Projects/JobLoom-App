import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Flag, Loader2 } from 'lucide-react';

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
  const { t } = useTranslation();
  const showEdit = isOwner && canEdit;
  const showDelete = isOwner && canDelete;
  const showReport = !isOwner;

  if (!showEdit && !showDelete && !showReport) return null;

  return (
    <div className="flex items-center gap-1">
      {showEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Pencil className="w-3 h-3" />
          {t('common.edit')}
        </button>
      )}
      {showDelete && (
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          {isDeleting ? t('reviews.deleting') : t('common.delete')}
        </button>
      )}
      {showReport && (
        <button
          onClick={onReport}
          disabled={isReporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-auto"
        >
          {isReporting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Flag className="w-3 h-3" />
          )}
          {isReporting ? t('reviews.reporting') : t('common.report')}
        </button>
      )}
    </div>
  );
};

export default ReviewCardActions;
