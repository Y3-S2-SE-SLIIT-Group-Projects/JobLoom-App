import { useTranslation } from 'react-i18next';
import { useOffline } from '../hooks/useOffline';
import { FaLeaf } from 'react-icons/fa';

const LowDataToggle = ({ className = '' }) => {
  const { t } = useTranslation();
  const { lowDataMode, toggleLowData } = useOffline();

  return (
    <button
      onClick={toggleLowData}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
        lowDataMode
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'text-muted hover:bg-surface-muted hover:text-text-dark'
      } ${className}`}
      title={lowDataMode ? t('navbar.low_data_on') : t('navbar.low_data_off')}
      aria-label={t('navbar.low_data_toggle')}
    >
      <FaLeaf className={`w-4 h-4 ${lowDataMode ? 'text-emerald-600' : 'opacity-60'}`} />
      <span className="hidden sm:inline">{t('navbar.low_data')}</span>
      {lowDataMode && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
    </button>
  );
};

export default LowDataToggle;
