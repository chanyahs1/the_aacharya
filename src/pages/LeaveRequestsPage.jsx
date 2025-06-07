import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, DocumentTextIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LeaveRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/leaves/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }

      const data = await response.json();
      setPendingRequests(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/leaves/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          approved_by: currentEmployee.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Refresh the list
      fetchPendingRequests();
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading leave requests...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-neutral-800">Pending Leave Requests</h2>
          <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
            {pendingRequests.length} requests
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-error-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No pending leave requests</p>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-neutral-900">
                        {request.employee_name} {request.employee_surname}
                      </h3>
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                        {request.employee_role}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <span className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {request.total_days} days
                        </span>
                      </div>
                      {request.reason && (
                        <div className="flex items-start">
                          <DocumentTextIcon className="w-4 h-4 text-neutral-400 mr-2 mt-1" />
                          <p className="text-sm text-neutral-600">{request.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, 'Approved')}
                      className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'Rejected')}
                      className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
} 