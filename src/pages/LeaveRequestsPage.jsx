import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LeaveRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [previousRequests, setPreviousRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiddenPreviousIds, setHiddenPreviousIds] = useState([]);

  const [pendingPage, setPendingPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    fetchPendingRequests();
    fetchPreviousRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setError(null);
      const res = await fetch('http://localhost:5000/api/leaves/pending');
      if (!res.ok) throw new Error('Failed to fetch pending requests');
      const data = await res.json();
      setPendingRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreviousRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leaves/previous');
      if (!res.ok) throw new Error('Failed to fetch previous requests');
      const data = await res.json();
      setPreviousRequests(data);
    } catch (err) {
      console.error('Error fetching previous requests:', err);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    let remark = null;
    if (status === 'Rejected') {
      remark = prompt('Enter reason for rejection:');
      if (!remark || remark.trim() === '') {
        alert('Rejection remark is required.');
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/leaves/request/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remark }),
      });

      if (!response.ok) throw new Error('Failed to update request status');

      fetchPendingRequests();
      fetchPreviousRequests();
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const paginate = (data, page) => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  const hidePreviousRequest = (id) => {
    setHiddenPreviousIds((prev) => [...prev, id]);
  };

  const filteredPendingRequests = pendingRequests.filter((r) =>
    `${r.employee_name} ${r.employee_surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPreviousRequests = previousRequests.filter(
    (r) =>
      `${r.employee_name} ${r.employee_surname}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !hiddenPreviousIds.includes(r.id)
  );

  const paginatedPending = paginate(filteredPendingRequests, pendingPage);
  const paginatedPrevious = paginate(filteredPreviousRequests, previousPage);

  if (isLoading) return <div className="text-center py-4">Loading leave requests...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Leave Requests</h1>
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2 px-3 py-2 border rounded-md w-full sm:w-64"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}

      <h2 className="text-xl font-semibold text-neutral-800 mb-2">Pending Leave Requests</h2>
      <div className="space-y-4">
        {paginatedPending.length === 0 ? (
          <p className="text-neutral-500 text-center">No pending leave requests</p>
        ) : (
          paginatedPending.map((request) => (
            <RequestCard key={request.id} request={request} handleRequestAction={handleRequestAction} showActions />
          ))
        )}
        <PaginationControls
          page={pendingPage}
          setPage={setPendingPage}
          totalItems={filteredPendingRequests.length}
        />
      </div>

      <h2 className="text-xl font-semibold text-neutral-800 mb-2 mt-10">Previous Leave Requests</h2>
      <div className="space-y-4">
        {paginatedPrevious.length === 0 ? (
          <p className="text-neutral-500 text-center">No previous leave requests</p>
        ) : (
          paginatedPrevious.map((request) => (
            <RequestCard key={request.id} request={request} onRemove={() => hidePreviousRequest(request.id)} />
          ))
        )}
        <PaginationControls
          page={previousPage}
          setPage={setPreviousPage}
          totalItems={filteredPreviousRequests.length}
        />
      </div>
    </div>
  );
}

function RequestCard({ request, handleRequestAction, showActions = false, onRemove }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow w-full">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {request.employee_name} {request.employee_surname} - {request.employee_department} {request.employee_role} - {request.employee_empID}
          </h3>
          <div className="text-xs text-neutral-500 mb-1">{request.leave_type_name}</div>
          <div className="text-xs text-neutral-500 mb-1">
            <span className="font-medium text-neutral-700">
              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium">{request.total_days} days</span>
          </div>
          <div className="text-xs text-neutral-500 mb-1">
            <span className="font-medium text-primary-700">Total leaves taken:</span> {request.total_leaves_taken || 0} days
          </div>
          {request.reason && <div className="text-xs text-neutral-600">Reason: {request.reason}</div>}
          {request.remark && request.status !== 'Pending' && (
            <div className="text-xs text-red-600">Remark: {request.remark}</div>
          )}
          {request.status !== 'Pending' && (
            <div className="text-xs mt-1 font-medium text-neutral-700">
              Status: <span className={`font-bold ${request.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>{request.status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row items-end sm:items-center">
        {showActions ? (
          <>
            <button
              onClick={() => handleRequestAction(request.id, 'Approved')}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <CheckCircleIcon className="w-5 h-5" /> Approve
            </button>
            <button
              onClick={() => handleRequestAction(request.id, 'Rejected')}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <XCircleIcon className="w-5 h-5" /> Reject
            </button>
          </>
        ) : onRemove ? (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PaginationControls({ page, setPage, totalItems }) {
  const totalPages = Math.ceil(totalItems / 4);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-3">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-3 py-1 text-sm border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="px-3 py-1 text-sm border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
