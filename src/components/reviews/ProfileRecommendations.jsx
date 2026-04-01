import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Star, Inbox, Send } from 'lucide-react';
import useUserReviews from '../../hooks/useUserReviews';
import useSentReviews from '../../hooks/useSentReviews';
import useRatingStats from '../../hooks/useRatingStats';
import ReceivedReviewsPanel from './ReceivedReviewsPanel';
import GivenReviewsPanel from './GivenReviewsPanel';
import TabBadge from '../ui/TabBadge';

const TABS = {
  RECEIVED: 'received',
  GIVEN: 'given',
};

const ProfileRecommendations = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(TABS.RECEIVED);

  const currentUser = useSelector(state => state.user.currentUser);
  const userId = currentUser?._id ?? null;

  const {
    reviews: received,
    isLoading: loadingReceived,
    error: errorReceived,
  } = useUserReviews(userId);
  const { reviews: given, isLoading: loadingGiven, error: errorGiven } = useSentReviews(userId);
  const { stats } = useRatingStats(userId);

  if (!userId) return null;

  const receivedCount = received?.length ?? 0;
  const givenCount = given?.length ?? 0;

  const tabCls = isActive =>
    [
      'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-text hover:border-gray-200',
    ].join(' ');

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 id="recommendations-heading" className="text-lg font-bold text-text leading-tight">
              {t('reviews.recommendations')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('reviews.recommendations_subtitle')}</p>
          </div>
          {(receivedCount > 0 || givenCount > 0) && (
            <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
              {t('reviews.total', { count: receivedCount + givenCount })}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex border-b border-gray-100">
          <button
            role="tab"
            aria-selected={activeTab === TABS.RECEIVED}
            aria-controls="panel-received"
            onClick={() => setActiveTab(TABS.RECEIVED)}
            className={tabCls(activeTab === TABS.RECEIVED)}
          >
            <Inbox className="w-3.5 h-3.5" />
            {t('reviews.tab_received')}
            <TabBadge count={receivedCount} />
          </button>

          <button
            role="tab"
            aria-selected={activeTab === TABS.GIVEN}
            aria-controls="panel-given"
            onClick={() => setActiveTab(TABS.GIVEN)}
            className={tabCls(activeTab === TABS.GIVEN)}
          >
            <Send className="w-3.5 h-3.5" />
            {t('reviews.tab_sent')}
            <TabBadge count={givenCount} />
          </button>
        </div>
      </div>

      {/* Tab panels */}
      <div className="px-6 py-6">
        <div role="tabpanel" id="panel-received" hidden={activeTab !== TABS.RECEIVED}>
          {activeTab === TABS.RECEIVED && (
            <ReceivedReviewsPanel
              reviews={received}
              isLoading={loadingReceived}
              error={errorReceived}
              stats={stats}
              userId={userId}
            />
          )}
        </div>

        <div role="tabpanel" id="panel-given" hidden={activeTab !== TABS.GIVEN}>
          {activeTab === TABS.GIVEN && (
            <GivenReviewsPanel
              reviews={given}
              isLoading={loadingGiven}
              error={errorGiven}
              userId={userId}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfileRecommendations;
