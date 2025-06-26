import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { UsersIcon, CheckCircleIcon, UserMinusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 8;

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEmployees(selectedDate);
  }, [selectedDate]);

  const fetchEmployees = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = `https://the-aacharya.onrender.com/api/attendance?date=${date}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleMarkAttendance = async (employeeId, status) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, status }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark attendance');
      }
      fetchEmployees(selectedDate);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleModifyAttendance = async (employeeId, status) => {
    const remark = prompt('Enter reason for modifying attendance:');
    if (!remark) return;

    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, status, remark, date: selectedDate }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to modify attendance');
      }
      fetchEmployees(selectedDate);
    } catch (err) {
      alert(err.message);
    }
  };

  const { departments, roles } = useMemo(() => {
    const departments = [...new Set(employees.map(e => e.department))].filter(Boolean);
    const roles = [...new Set(employees.map(e => e.role))].filter(Boolean);
    return { departments, roles };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    setCurrentPage(1);
    return employees.filter(emp => {
      const empStatus = emp.attendance_status || 'Not Marked';
      if (statusFilter !== 'all' && empStatus !== statusFilter) return false;
      if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
      if (searchTerm) {
        const fullName = `${emp.name} ${emp.surname}`.toLowerCase();
        const empIdString = emp.empID ? emp.empID.toString().toLowerCase() : '';
        if (!fullName.includes(searchTerm.toLowerCase()) && !empIdString.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter]);

  const presentCount = filteredEmployees.filter(e => e.attendance_status === 'Present').length;
  const absentCount = filteredEmployees.filter(e => e.attendance_status === 'Absent').length;
  const notMarkedCount = filteredEmployees.filter(e => !e.attendance_status).length;

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(selectedDate.replace(/-/g, '/')), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<UsersIcon />} title="Total Employees" value={filteredEmployees.length} color="blue" />
          <StatCard icon={<CheckCircleIcon />} title="Present" value={presentCount} color="green" />
          <StatCard icon={<UserMinusIcon />} title="Absent" value={absentCount} color="red" />
          <StatCard icon={<QuestionMarkCircleIcon />} title="Not Marked" value={notMarkedCount} color="yellow" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
            />
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
              <option value="all">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Not Marked">Not Marked</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remark</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 px-6 text-center text-gray-500">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan="5" className="py-12 px-6 text-center text-red-500">{error}</td></tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 px-6 text-center text-gray-500">
                      <h3 className="text-lg font-medium">No records found</h3>
                      <p className="text-sm text-gray-400">Try adjusting your filters or selecting a different date.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{emp.name} {emp.surname}</div>
                        <div className="text-sm text-gray-500">ID: {emp.empID}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{emp.department}</div>
                        <div className="text-sm text-gray-500">{emp.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={emp.attendance_status} isToday={isToday} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{emp.attendance_remark || '-'}</td>
                      <td className="px-6 py-4">
                        {emp.attendance_status ? (
                          <button
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            onClick={() => handleModifyAttendance(emp.id, emp.attendance_status === 'Present' ? 'Absent' : 'Present')}
                          >
                            Modify
                          </button>
                        ) : isToday ? (
                          <div className="flex gap-2">
                            <button className="text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-800 hover:bg-green-200" onClick={() => handleMarkAttendance(emp.id, 'Present')}>Present</button>
                            <button className="text-xs px-2 py-1 rounded-full font-semibold bg-red-100 text-red-800 hover:bg-red-200" onClick={() => handleMarkAttendance(emp.id, 'Absent')}>Absent</button>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-gray-200">
              <Pagination currentPage={currentPage} totalItems={filteredEmployees.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, isToday }) => {
  if (!status) {
    return <span className="text-xs font-medium text-gray-500">{isToday ? "Awaiting" : "Not Marked"}</span>;
  }
  const colors = {
    Present: "bg-green-100 text-green-800",
    Absent: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
