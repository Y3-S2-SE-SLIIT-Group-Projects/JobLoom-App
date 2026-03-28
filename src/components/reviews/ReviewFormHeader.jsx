import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ReviewFormHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.back')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text">{t('reviews.write_review_title')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{t('reviews.write_review_subtitle')}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormHeader;
