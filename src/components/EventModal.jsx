import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function EventModal({ isOpen, onClose, onSubmit, selectedDate, employees, event }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: []
  });

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      // If we're updating an event, use its data
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          startTime: new Date(event.start_time).toISOString().slice(0, 16),
          endTime: new Date(event.end_time).toISOString().slice(0, 16),
          attendees: event.attendees ? event.attendees.map(a => a.id.toString()) : []
        });
      } else {
        // For new events, use default values
        setFormData(prev => ({
          ...prev,
          startTime: `${dateStr}T${hours}:${minutes}`,
          endTime: `${dateStr}T${String(now.getHours() + 1).padStart(2, '0')}:${minutes}`
        }));
      }
    }
  }, [selectedDate, event]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate end time is after start time
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      attendees: []
    });
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If changing start time, adjust end time to be 1 hour later
      if (field === 'startTime' && value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        newData.endTime = endDate.toISOString().slice(0, 16);
      }
      
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            {event ? 'Update Meeting' : 'Schedule Meeting'}
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
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter meeting title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter meeting description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                min={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Attendees
            </label>
            <select
              multiple
              value={formData.attendees}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                attendees: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              size={4}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.surname} - {emp.department} {emp.role}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Hold Ctrl/Cmd to select multiple attendees
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {event ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 