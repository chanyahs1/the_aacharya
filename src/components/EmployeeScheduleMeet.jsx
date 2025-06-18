import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, LinkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default function EmployeeScheduleMeet({ employeeId, onClose, onSchedule }) {
  const [meetDetails, setMeetDetails] = useState({
    date: '',
    time: '',
    link: '',
    remarks: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(meetDetails);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={meetDetails.date}
                onChange={(e) => setMeetDetails(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Time
            </label>
            <div className="relative">
              <input
                type="time"
                required
                value={meetDetails.time}
                onChange={(e) => setMeetDetails(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <ClockIcon className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Meeting Link
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://meet.google.com/..."
                value={meetDetails.link}
                onChange={(e) => setMeetDetails(prev => ({ ...prev, link: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <LinkIcon className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Remarks
            </label>
            <div className="relative">
              <textarea
                value={meetDetails.remarks}
                onChange={(e) => setMeetDetails(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Add any additional notes or instructions..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
              <ChatBubbleLeftIcon className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 