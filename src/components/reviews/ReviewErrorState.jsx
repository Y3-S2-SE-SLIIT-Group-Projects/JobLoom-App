import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

const ReviewErrorState = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <p className="text-sm text-red-600 max-w-xs">
        {message || t('reviews.error_load_failed')}
      </p>
    </div>
  );
};

export default ReviewErrorState;
