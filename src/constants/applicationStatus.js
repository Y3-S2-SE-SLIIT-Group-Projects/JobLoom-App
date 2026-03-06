/**
 * Shared application status constants for employer and job seeker views.
 */
export const APPLICATION_STATUSES = [
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
];

export const STATUS_BADGE_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const STATUS_TAB_COLORS = {
  all: 'border-[#6794D1] text-[#6794D1]',
  pending: 'border-yellow-500 text-yellow-700',
  reviewed: 'border-blue-500 text-blue-700',
  shortlisted: 'border-purple-500 text-purple-700',
  accepted: 'border-green-500 text-green-700',
  rejected: 'border-red-500 text-red-700',
  withdrawn: 'border-gray-400 text-gray-500',
};

export const WITHDRAWABLE_STATUSES = ['pending', 'reviewed', 'shortlisted'];
