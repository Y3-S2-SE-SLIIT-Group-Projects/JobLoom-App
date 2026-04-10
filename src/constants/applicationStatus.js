/* Shared application status constants for employer and job seeker views */
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

/* Seeker application cards */
export const STATUS_CARD_THEME = {
  pending: {
    bar: 'from-yellow-400 to-yellow-500',
    icon: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200/70',
    wash: 'from-yellow-50/90 via-surface to-surface',
    hoverBorder: 'hover:border-yellow-300/55',
    cta: 'bg-yellow-500 text-white shadow-sm hover:bg-yellow-600 hover:shadow-md active:scale-[0.98]',
  },
  reviewed: {
    bar: 'from-sky-400 to-blue-600',
    icon: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200/70',
    wash: 'from-blue-50/90 via-surface to-surface',
    hoverBorder: 'hover:border-blue-300/55',
    cta: 'bg-primary text-white shadow-sm hover:bg-deep-blue hover:shadow-md active:scale-[0.98]',
  },
  shortlisted: {
    bar: 'from-violet-400 to-purple-600',
    icon: 'bg-purple-100 text-purple-800 ring-1 ring-inset ring-purple-200/70',
    wash: 'from-purple-50/90 via-surface to-surface',
    hoverBorder: 'hover:border-purple-300/55',
    cta: 'bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:shadow-md active:scale-[0.98]',
  },
  accepted: {
    bar: 'from-emerald-400 to-green-600',
    icon: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200/70',
    wash: 'from-green-50/90 via-surface to-surface',
    hoverBorder: 'hover:border-green-300/55',
    cta: 'bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md active:scale-[0.98]',
  },
  rejected: {
    bar: 'from-rose-400 to-red-600',
    icon: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200/70',
    wash: 'from-red-50/80 via-surface to-surface',
    hoverBorder: 'hover:border-red-300/55',
    cta: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.98]',
  },
  withdrawn: {
    bar: 'from-neutral-300 to-neutral-400',
    icon: 'bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200/80',
    wash: 'from-neutral-100/90 via-surface to-surface',
    hoverBorder: 'hover:border-neutral-300/80',
    cta: 'border border-neutral-300 bg-surface-muted text-neutral-600 hover:bg-neutral-200/70 hover:border-neutral-400',
  },
};
