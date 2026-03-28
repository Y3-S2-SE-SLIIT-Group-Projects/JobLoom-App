import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

const ReviewSuccessScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-text">{t('reviews.review_submitted_full')}</h2>
        <p className="text-sm text-gray-400 mt-2">{t('reviews.redirecting_profile')}</p>
        <div className="mt-6 flex justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default ReviewSuccessScreen;
