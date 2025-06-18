import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchEmployees(selectedDate);
  }, [selectedDate]);

  const fetchEmployees = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = `http://${window.location.hostname}:5000/api/attendance?date=${date}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        let errorMsg = 'Failed to fetch employees';
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg += `: ${errData.error}`;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleMarkAttendance = async (employeeId, status) => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to mark attendance');
      fetchEmployees(selectedDate);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleModifyAttendance = async (employeeId, status) => {
    const remark = prompt('Enter reason for modifying attendance:');
    if (!remark) return alert('Remark is required.');

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          status,
          remark,
          date: selectedDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to modify attendance');
      fetchEmployees(selectedDate);
    } catch (err) {
      alert(err.message);
    }
  };

  const presentCount = employees.filter(emp => emp.attendance_status === 'Present').length;
  const totalCount = employees.length;
  const presentPercent = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="gap-4 mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-neutral-800">Attendance Management</h1>
          <p className="text-neutral-600 mt-1">Mark and track employee attendance</p>
          <div className='flex flex-row flex-wrap gap-[30px] mx-[30px] my-[20px]'>
            <div className="bg-success-100 rounded-lg px-6 py-4 flex flex-col items-center min-w-[240px] min-h-[100px] justify-center">
              <span className="text-2xl font-bold text-success-800">{presentCount}</span>
              <span className="text-sm text-success-800 mt-1">Present</span>
            </div>
            <div className="bg-primary-100 rounded-lg px-6 py-4 flex flex-col items-center min-w-[240px] min-h-[100px] justify-center">
              <span className="text-2xl font-bold text-primary-800">{presentPercent}%</span>
              <span className="text-sm text-primary-800 mt-1">% Present</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-neutral-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-neutral-800">
        {selectedDate === new Date().toISOString().split('T')[0]
          ? "Today's Attendance"
          : `Attendance for ${format(new Date(selectedDate), 'MMMM do, yyyy')}`}
      </h2>
      <p className="text-sm text-neutral-500 mt-1">
        {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
      </p>

      {loading ? (
        <div className="py-10 text-center text-neutral-500">Loading attendance...</div>
      ) : error ? (
        <div className="py-10 text-center text-error-600">{error}</div>
      ) : (
        <div className="mt-6 bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Remark</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-neutral-500">No records found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{emp.name} {emp.surname}</div>
                      <div className="text-sm text-neutral-500">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-900">{emp.department} {emp.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {emp.attendance_status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.attendance_status === 'Present' ? 'bg-success-100 text-success-800' :
                          emp.attendance_status === 'Absent' ? 'bg-error-100 text-error-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {emp.attendance_status}
                        </span>
                      ) : (
                        isToday ? (
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 rounded bg-success-600 text-white text-xs hover:bg-success-700"
                              onClick={() => handleMarkAttendance(emp.id, 'Present')}
                            >
                              Mark Present
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-error-600 text-white text-xs hover:bg-error-700"
                              onClick={() => handleMarkAttendance(emp.id, 'Absent')}
                            >
                              Mark Absent
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">Not marked</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{emp.attendance_remark || '-'}</td>
                    <td className="px-6 py-4">
                      {emp.attendance_status ? (
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => handleModifyAttendance(emp.id, emp.attendance_status === 'Present' ? 'Absent' : 'Present')}
                        >
                          Modify
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
