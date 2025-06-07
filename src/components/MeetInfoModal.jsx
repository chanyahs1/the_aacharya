import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function MeetInfoModal({ isOpen, onClose, meetInfo, onSave, applicationId }) {
  const [formData, setFormData] = useState({
    meet_remarks: '',
    meet_link: '',
    meet_datetime: ''
  });

  useEffect(() => {
    if (meetInfo) {
      setFormData({
        meet_remarks: meetInfo.meet_remarks || '',
        meet_link: meetInfo.meet_link || '',
        meet_datetime: meetInfo.meet_datetime || ''
      });
    }
  }, [meetInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(applicationId, formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">
            {meetInfo?.meet_remarks ? 'Edit Meet Information' : 'Add Meet Information'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="meet_remarks" className="block text-sm font-medium text-neutral-700">
              Remarks
            </label>
            <textarea
              id="meet_remarks"
              name="meet_remarks"
              value={formData.meet_remarks}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter meeting remarks..."
            />
          </div>

          <div>
            <label htmlFor="meet_link" className="block text-sm font-medium text-neutral-700">
              Meet Link
            </label>
            <input
              type="url"
              id="meet_link"
              name="meet_link"
              value={formData.meet_link}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter meeting link..."
            />
          </div>

          <div>
            <label htmlFor="meet_datetime" className="block text-sm font-medium text-neutral-700">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="meet_datetime"
              name="meet_datetime"
              value={formData.meet_datetime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {meetInfo?.meet_remarks ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 