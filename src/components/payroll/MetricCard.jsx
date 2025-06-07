import React from 'react';
import { motion } from 'framer-motion';

export default function MetricCard({ title, value, change, period, type, additionalInfo }) {
  // Determine color and icon based on change direction and type
  const getChangeDisplay = () => {
    if (!change) return null;
    
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    
    // Different metrics might interpret positive/negative differently
    // For costs, positive change might be bad, for revenue it's good
    const isGood = type === 'cost' ? isNegative : isPositive;
    
    const textColor = isGood ? 'text-success-600' : 'text-error-600';
    
    return (
      <span className={`flex items-center text-sm font-medium ${textColor}`}>
        {change}
        {isPositive && (
          <svg className="w-4 h-4 ml-1\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
            <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
        {isNegative && (
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {period && <span className="ml-1 text-neutral-500">{period}</span>}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card hover:shadow-elevated transition-shadow duration-300"
    >
      <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-neutral-900">{value}</span>
          {additionalInfo && (
            <span className="ml-2 text-sm text-neutral-500">{additionalInfo}</span>
          )}
        </div>
        {getChangeDisplay()}
      </div>
    </motion.div>
  );
}