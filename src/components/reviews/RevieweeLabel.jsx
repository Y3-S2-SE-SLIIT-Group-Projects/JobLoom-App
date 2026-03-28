const RevieweeLabel = ({ review }) => {
  const reviewee = review.revieweeId;
  if (!reviewee) return null;

  const name = `${reviewee.firstName ?? ''} ${reviewee.lastName ?? ''}`.trim();

  return (
    <p className="text-xs text-muted mb-1.5 px-1">
      Reviewed: <span className="font-semibold text-text-dark">{name || 'Unknown user'}</span>
    </p>
  );
};

export default RevieweeLabel;
