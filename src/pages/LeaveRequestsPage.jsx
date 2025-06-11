import React, { useEffect, useState } from 'react';
import { UserCircleIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function LeaveRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
    // eslint-disable-next-line
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
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update request status');
      }
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
    <div className="">
      <div className="flex items-center mb-6 gap-3">        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Pending Leave Requests</h1>
          <p className="text-neutral-500 text-sm">Review and manage all pending leave requests</p>
        </div>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}
      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-neutral-500 text-center">No pending leave requests</p>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.id} className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate">{request.employee_name} {request.employee_surname} - {request.employee_department} {request.employee_role} - {request.employee_empID}</h3>
                  <div className="text-xs text-neutral-500 mb-1">{request.leave_type_name}</div>
                  <div className="text-xs text-neutral-500 mb-1">
                    <span className="font-medium text-neutral-700">{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">{request.total_days} days</span>
                  </div>
                  <div className="text-xs text-neutral-500 mb-1">
                    <span className="font-medium text-primary-700">Total leaves taken:</span> {request.total_leaves_taken || 0} days
                  </div>
                  {request.reason && <div className="text-xs text-neutral-600">Reason: {request.reason}</div>}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row items-end sm:items-center">
                <button
                  onClick={() => handleRequestAction(request.id, 'Approved')}
                  className="flex items-center gap-1 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <CheckCircleIcon className="w-5 h-5" /> Approve
                </button>
                <button
                  onClick={() => handleRequestAction(request.id, 'Rejected')}
                  className="flex items-center gap-1 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <XCircleIcon className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 