import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function LeaveManagement({ employeeId }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveData();
  }, [employeeId]);

  const fetchLeaveData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch leave types
      const typesRes = await fetch('http://localhost:5000/api/leaves/types');
      const typesData = await typesRes.json();
      setLeaveTypes(typesData);

      // Fetch leave balance
      const balanceRes = await fetch(`http://localhost:5000/api/leaves/balance/${employeeId}`);
      const balanceData = await balanceRes.json();
      setLeaveBalance(balanceData);

      // Fetch leave requests
      const requestsRes = await fetch(`http://localhost:5000/api/leaves/requests/${employeeId}`);
      const requestsData = await requestsRes.json();
      setLeaveRequests(requestsData);
    } catch (err) {
      setError('Failed to fetch leave data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const response = await fetch('http://localhost:5000/api/leaves/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId,
          leave_type_id: formData.leave_type_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: totalDays,
          reason: formData.reason
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit leave request');
      }

      // Reset form and refresh data
      setFormData({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setShowRequestForm(false);
      fetchLeaveData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading leave data...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Leave Balance Section */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveBalance.map((balance) => (
            <div
              key={balance.leave_type_id}
              className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <h3 className="font-medium text-neutral-900">{balance.leave_type_name}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                  {balance.used_days} / {balance.total_days} days used
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {balance.total_days - balance.used_days} days remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Request Form */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Leave Requests</h2>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showRequestForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {showRequestForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Leave Type
                </label>
                <select
                  name="leave_type_id"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.leave_type_id}
                  onChange={handleChange}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reason
                </label>
                <textarea
                  name="reason"
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        {/* Leave Requests List */}
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No leave requests found</p>
          ) : (
            leaveRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      {request.leave_type_name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-neutral-500">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {request.total_days} days
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${request.status === 'Approved' ? 'bg-success-100 text-success-800' :
                      request.status === 'Rejected' ? 'bg-error-100 text-error-800' :
                      'bg-warning-100 text-warning-800'}`}
                  >
                    {request.status}
                  </span>
                </div>
                {request.reason && (
                  <div className="mt-2 flex items-start">
                    <DocumentTextIcon className="w-4 h-4 text-neutral-400 mr-2 mt-1" />
                    <p className="text-sm text-neutral-600">{request.reason}</p>
                  </div>
                )}
                {request.approved_by && (
                  <div className="mt-2 text-xs text-neutral-500">
                    Approved by: {request.approver_name} {request.approver_surname}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 