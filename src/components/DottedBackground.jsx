const DottedBackground = ({ children, className = '' }) => {
  return (
    <div
      className={`min-h-screen bg-[#F4F6F9] transition-all duration-300 ${className}`}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(103, 148, 209, 0.1) 2px, transparent 2px)',
        backgroundSize: '32px 32px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundImage =
          'radial-gradient(circle, rgba(103, 148, 209, 0.2) 2px, transparent 2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundImage =
          'radial-gradient(circle, rgba(103, 148, 209, 0.1) 2px, transparent 2px)';
      }}
    >
      {children}
    </div>
  );
};

export default DottedBackground;
