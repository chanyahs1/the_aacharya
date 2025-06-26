import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function MeetInfoModal({ isOpen, onClose, meetInfo, onSave, applicationId }) {
  const [formData, setFormData] = useState({
    meet_remarks: '',
    meet_link: '',
    meet_datetime: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (meetInfo) {
      setFormData({
        meet_remarks: meetInfo.meet_remarks || '',
        meet_link: meetInfo.meet_link || '',
        meet_datetime: meetInfo.meet_datetime || ''
      });
    }
  }, [meetInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const generateMeetLink = async () => {
  const { meet_datetime } = formData;

  if (!meet_datetime) {
    alert("Please select a valid date & time.");
    return;
  }

  try {
    setIsGenerating(true);

    const response = await fetch("https://the-aacharya.onrender.com/api/create-interview-meet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        summary: "Candidate Interview",
        start: meet_datetime,
        attendees: meetInfo?.candidate_email ? [{ email: meetInfo.candidate_email }] : [],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create Meet");

    // ✅ Correctly update formData instead of undefined setMeetInfo
    setFormData((prev) => ({
      ...prev,
      meet_link: data.meetLink,
    }));
  } catch (err) {
    console.error("Error:", err.message);
    alert("Error generating Meet link.\n" + err.message);
  } finally {
    setIsGenerating(false);
  }
};




  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(applicationId, formData);
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

          <div>
            <label htmlFor="meet_link" className="block text-sm font-medium text-neutral-700">
              Meet Link
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                id="meet_link"
                name="meet_link"
                value={formData.meet_link}
                readOnly
                disabled={isGenerating}
                className="flex-1 mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100"
                placeholder="Generating link..."
              />
              <button
                type="button"
                onClick={generateMeetLink}
                disabled={isGenerating || !formData.meet_datetime}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !formData.meet_link}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {meetInfo?.meet_remarks ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
