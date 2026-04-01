import { useRef } from 'react';

const dotPattern = opacity =>
  `radial-gradient(circle, color-mix(in srgb, var(--color-primary) ${opacity}%, transparent) 2px, transparent 2px)`;

const DottedBackground = ({ children, className = '' }) => {
  const rootRef = useRef(null);

  const setDotOpacity = pct => {
    const el = rootRef.current;
    if (el) el.style.backgroundImage = dotPattern(pct);
  };

  return (
    <div
      ref={rootRef}
      className={`bg-surface-muted transition-all duration-300 ${className}`}
      style={{
        backgroundImage: dotPattern(12),
        backgroundSize: '32px 32px',
      }}
      onMouseEnter={() => setDotOpacity(20)}
      onMouseLeave={() => setDotOpacity(12)}
    >
      {children}
    </div>
  );
};

export default DottedBackground;
