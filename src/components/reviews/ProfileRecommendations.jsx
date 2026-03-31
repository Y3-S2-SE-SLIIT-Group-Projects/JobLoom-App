import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaInbox, FaPaperPlane } from 'react-icons/fa';

import useUserReviews from '../../hooks/useUserReviews';
import useSentReviews from '../../hooks/useSentReviews';
import useRatingStats from '../../hooks/useRatingStats';
import ReceivedReviewsPanel from './ReceivedReviewsPanel';
import GivenReviewsPanel from './GivenReviewsPanel';
import TabBadge from '../ui/TabBadge';

const TABS = { RECEIVED: 'received', GIVEN: 'given' };

const tabClass = (active, current) =>
  [
    'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
    active === current
      ? 'border-primary text-primary'
      : 'border-transparent text-muted hover:text-text-dark hover:border-border',
  ].join(' ');

const ProfileRecommendations = () => {
  const [activeTab, setActiveTab] = useState(TABS.RECEIVED);

  const currentUser = useSelector(state => state.user.currentUser);
  const userId = currentUser?._id ?? null;

  const {
    reviews: receivedReviews,
    isLoading: loadingReceived,
    error: errorReceived,
  } = useUserReviews(userId);

  const {
    reviews: givenReviews,
    isLoading: loadingGiven,
    error: errorGiven,
  } = useSentReviews(userId);

  const { stats } = useRatingStats(userId);

  const receivedCount = receivedReviews?.length ?? 0;
  const givenCount = givenReviews?.length ?? 0;

  if (!userId) return null;

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden"
    >
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaStar className="w-4 h-4 text-primary" />
          </div>
          <h2 id="recommendations-heading" className="text-xl font-bold text-text-dark">
            Recommendations
          </h2>
          {(receivedCount > 0 || givenCount > 0) && (
            <span className="ml-auto text-sm text-muted">{receivedCount + givenCount} total</span>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Recommendations tabs"
          className="flex border-b border-border"
        >
          <button
            role="tab"
            id="tab-received"
            aria-controls="panel-received"
            aria-selected={activeTab === TABS.RECEIVED}
            onClick={() => setActiveTab(TABS.RECEIVED)}
            className={tabClass(activeTab, TABS.RECEIVED)}
          >
            <FaInbox className="w-3.5 h-3.5" />
            Received
            <TabBadge count={receivedCount} />
          </button>

          <button
            role="tab"
            id="tab-given"
            aria-controls="panel-given"
            aria-selected={activeTab === TABS.GIVEN}
            onClick={() => setActiveTab(TABS.GIVEN)}
            className={tabClass(activeTab, TABS.GIVEN)}
          >
            <FaPaperPlane className="w-3.5 h-3.5" />
            Given
            <TabBadge count={givenCount} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div
          role="tabpanel"
          id="panel-received"
          aria-labelledby="tab-received"
          hidden={activeTab !== TABS.RECEIVED}
        >
          {activeTab === TABS.RECEIVED && (
            <ReceivedReviewsPanel
              reviews={receivedReviews}
              isLoading={loadingReceived}
              error={errorReceived}
              stats={stats}
              userId={userId}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-given"
          aria-labelledby="tab-given"
          hidden={activeTab !== TABS.GIVEN}
        >
          {activeTab === TABS.GIVEN && (
            <GivenReviewsPanel
              reviews={givenReviews}
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
