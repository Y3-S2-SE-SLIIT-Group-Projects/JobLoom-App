export const FILTER_OPTIONS = [
  { value: '', label: 'All Reviews' },
  { value: 'employer', label: 'As Employer' },
  { value: 'job_seeker', label: 'As Job Seeker' },
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-rating', label: 'Highest Rating' },
  { value: 'rating', label: 'Lowest Rating' },
];

export const CRITERIA_CONFIG = [
  { key: 'workQuality', label: 'Work Quality', showFor: 'both' },
  { key: 'communication', label: 'Communication', showFor: 'both' },
  { key: 'punctuality', label: 'Punctuality', showFor: 'job_seeker' },
  { key: 'paymentOnTime', label: 'Payment on Time', showFor: 'employer' },
];
