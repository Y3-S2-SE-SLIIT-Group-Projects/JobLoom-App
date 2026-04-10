import { useState, useEffect } from 'react';

const StatCard = ({ icon: Icon, title, value, trend, trendValue, color = 'blue', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const steps = 60;
      const stepValue = value / steps;
      let currentStep = 0;

      const counter = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.min(Math.floor(stepValue * currentStep), value));
        if (currentStep >= steps) clearInterval(counter);
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
    pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50',
  };

  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-border group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} mb-3 group-hover:scale-105 transition-transform duration-300`}
          >
            {Icon && <Icon className="w-6 h-6 text-white" />}
          </div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-text-dark">{displayValue.toLocaleString()}</h3>
            {trend && trendValue && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${trendColors[trend]}`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
