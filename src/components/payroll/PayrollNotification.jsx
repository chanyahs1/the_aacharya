import React from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PayrollNotification({ onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-4 mb-4 bg-success-50 border border-success-200 rounded-md"
    >
      <div className="flex items-center">
        <InformationCircleIcon className="w-6 h-6 mr-2 text-success-500" />
        <p className="text-neutral-800">
          Payroll submission for the current pay period is due in 2 days. Review and finalize all employee payroll details.
        </p>
      </div>
      <div className="flex items-center ml-4">
        <button className="px-3 py-1 text-sm font-medium text-success-700 bg-success-100 rounded-md hover:bg-success-200 mr-3">
          MORE DETAILS
        </button>
        <button 
          onClick={onClose} 
          className="text-neutral-400 hover:text-neutral-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}