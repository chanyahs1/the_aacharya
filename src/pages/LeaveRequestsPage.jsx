import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon, MagnifyingGlassIcon, CalendarIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

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
      const res = await fetch('https://the-aacharya.onrender.com/api/leaves/pending');
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
      const res = await fetch('https://the-aacharya.onrender.com/api/leaves/previous');
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
      const response = await fetch(`https://the-aacharya.onrender.com/api/leaves/request/${requestId}`, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
              <p className="text-gray-600">Review and manage employee leave requests</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full lg:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPendingRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPreviousRequests.filter(r => r.status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPreviousRequests.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending Leave Requests</h2>
              <p className="text-gray-600 text-sm mt-1">Requests awaiting your approval</p>
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {filteredPendingRequests.length} pending
            </div>
          </div>
          
          <div className="space-y-4">
            {paginatedPending.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No pending leave requests</p>
                <p className="text-gray-400 text-sm">All requests have been processed</p>
              </div>
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
        </div>

        {/* Previous Requests Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Previous Leave Requests</h2>
              <p className="text-gray-600 text-sm mt-1">Historical leave request data</p>
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredPreviousRequests.length} total
            </div>
          </div>
          
          <div className="space-y-4">
            {paginatedPrevious.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No previous leave requests</p>
                <p className="text-gray-400 text-sm">No historical data available</p>
              </div>
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
      </div>
    </div>
  );
}

function RequestCard({ request, handleRequestAction, showActions = false, onRemove }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'Rejected':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Employee Info */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {request.employee_name} {request.employee_surname}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  {request.employee_department} • {request.employee_role}
                </div>
                <span className="text-blue-600 font-medium">ID: {request.employee_empID}</span>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Leave Period</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Leave Type</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {request.leave_type_name}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Duration:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {request.total_days} days
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total leaves taken:</span>
              <span className="text-sm text-gray-600">{request.total_leaves_taken || 0} days</span>
            </div>
          </div>

          {/* Reason */}
          {request.reason && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-gray-600">{request.reason}</p>
            </div>
          )}

          {/* Remark */}
          {request.remark && request.status !== 'Pending' && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600">{request.remark}</p>
            </div>
          )}

          {/* Status */}
          {request.status !== 'Pending' && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 lg:items-end">
          {showActions ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleRequestAction(request.id, 'Approved')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => handleRequestAction(request.id, 'Rejected')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <XCircleIcon className="w-5 h-5" />
                Reject
              </button>
            </div>
          ) : onRemove ? (
            <button
              onClick={onRemove}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Remove from view"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PaginationControls({ page, setPage, totalItems }) {
  const totalPages = Math.ceil(totalItems / 4);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              pageNum === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Next
      </button>
    </div>
  );
}
