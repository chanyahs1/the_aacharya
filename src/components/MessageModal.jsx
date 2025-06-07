import React from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default function MessageModal({ isOpen, onClose, message, onApprove, onReject, onRemark }) {
  if (!isOpen || !message) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Application Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Candidate Information */}
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Name: <span className="font-medium text-neutral-800">{message.candidate_name}</span></p>
                <p className="text-sm text-neutral-600">Email: <span className="font-medium text-neutral-800">{message.candidate_email}</span></p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Role: <span className="font-medium text-neutral-800">{message.job_role}</span></p>
                <p className="text-sm text-neutral-600">Status: <span className="font-medium text-neutral-800">{message.status}</span></p>
              </div>
            </div>
          </div>

          {/* Resume */}
          {message.resume_url && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Resume</h3>
              <a 
                href={message.resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View Resume
              </a>
            </div>
          )}

          {/* Meet Information */}
          {(message.meet_remarks || message.meet_link || message.meet_datetime) && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Meet Information</h3>
              {message.meet_remarks && (
                <p className="text-sm text-neutral-600 mb-2">
                  <span className="font-medium">Remarks:</span> {message.meet_remarks}
                </p>
              )}
              {message.meet_link && (
                <p className="text-sm text-neutral-600 mb-2">
                  <span className="font-medium">Link:</span>{' '}
                  <a 
                    href={message.meet_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Join Meet
                  </a>
                </p>
              )}
              {message.meet_datetime && (
                <p className="text-sm text-neutral-600">
                  <span className="font-medium">Date & Time:</span> {formatDateTime(message.meet_datetime)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => onRemark(message)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 flex items-center"
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
              Add Remark
            </button>
            <button
              onClick={() => onReject(message)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Reject
            </button>
            <button
              onClick={() => onApprove(message)}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 