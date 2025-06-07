import React from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EventOptionsModal({ isOpen, onClose, event, onUpdate, onDelete }) {
  if (!isOpen) return null;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Event Options</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-lg text-neutral-900">{event.title}</h3>
          <p className="text-neutral-600 mt-1">{event.description}</p>
          <div className="mt-2 text-sm text-neutral-500">
            <p>Date: {formatDate(event.start_time)}</p>
            <p>Time: {formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
            <p className="mt-1">
              Attendees: {event.attendees ? event.attendees.length : 0} people
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onUpdate(event)}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            Update Event
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
                onDelete(event.id);
              }
            }}
            className="w-full flex items-center justify-center px-4 py-2 bg-error-50 text-error-700 rounded-md hover:bg-error-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Cancel Event
          </button>
        </div>
      </div>
    </div>
  );
} 