import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';

const CommentRecommendationSection = ({ form, handleChange, commentFieldId, onPrev, onNext }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor={commentFieldId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {t('reviews.comment_label')}
        </label>
        <textarea
          id={commentFieldId}
          name="comment"
          rows={5}
          maxLength={1000}
          placeholder={t('reviews.comment_placeholder')}
          value={form.comment}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-gray-300 bg-white"
        />
        <p className="mt-1 text-xs text-right text-gray-400">
          {t('reviews.comment_count', { count: form.comment.length })}
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 hover:border-primary/20 transition-colors group">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
          form.wouldRecommend
            ? 'bg-primary border-primary'
            : 'border-gray-300 group-hover:border-primary/50'
        }`}>
          {form.wouldRecommend && <ThumbsUp className="w-2.5 h-2.5 text-white" />}
        </div>
        <input
          type="checkbox"
          name="wouldRecommend"
          checked={form.wouldRecommend}
          onChange={handleChange}
          className="sr-only"
        />
        <span className="text-sm text-gray-700">{t('reviews.would_recommend_label')}</span>
      </label>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:border-primary/30 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous')}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CommentRecommendationSection;
