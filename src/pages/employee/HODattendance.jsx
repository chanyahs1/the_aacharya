import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CalendarCheck2, Search, Briefcase, Building, Filter } from 'lucide-react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        return null;
    }

    const handlePrev = () => {
        onPageChange(Math.max(currentPage - 1, 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(currentPage + 1, totalPages));
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                Next
            </button>
        </div>
    );
};

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [uniqueDepartments, setUniqueDepartments] = useState(['All']);
  const [uniqueRoles, setUniqueRoles] = useState(['All']);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentEmployee');
    if (stored) {
      const emp = JSON.parse(stored);
      setCurrentEmployee(emp);
      fetchEmployees(selectedDate, emp); 
    } else {
      setLoading(false);
      setError("Current employee not found in localStorage");
    }
  }, [selectedDate]);

  useEffect(() => {
      setCurrentPage(1);
  },[selectedDate, searchTerm, selectedDepartment, selectedRole, selectedStatus]);

  const fetchEmployees = async (date, emp) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://the-aacharya.onrender.com/api/attendance?date=${date}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch employees");
      }

      const data = await response.json();
      let filtered = data;
      if (emp?.role === 'Head of Department' && emp.department) {
        filtered = data.filter(e => e.department === emp.department);
      }
      setEmployees(filtered);
      setUniqueDepartments(['All', ...new Set(filtered.map(e => e.department))]);
      setUniqueRoles(['All', ...new Set(filtered.map(e => e.role))]);

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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to mark attendance');
      fetchEmployees(selectedDate, currentEmployee);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEmployees = employees.filter(emp => {
      const status = emp.attendance_status || 'Not Marked';
      const name = `${emp.name} ${emp.surname}`.toLowerCase();
      const empID = String(emp.empID || '').toLowerCase();
      
      return (
          (selectedDepartment === 'All' || emp.department === selectedDepartment) &&
          (selectedRole === 'All' || emp.role === selectedRole) &&
          (selectedStatus === 'All' || status === selectedStatus) &&
          (searchTerm === '' || name.includes(searchTerm.toLowerCase()) || empID.includes(searchTerm.toLowerCase()))
      );
  });

  const presentCount = filteredEmployees.filter(emp => emp.attendance_status === 'Present').length;
  const totalCount = filteredEmployees.length;
  const presentPercent = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <CalendarCheck2 className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">{currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}</p>
          </div>
        </div>
        {/* Summary & Date Picker Card */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <div className="flex flex-row flex-wrap gap-6">
            <div className="bg-green-100 rounded-lg px-6 py-4 flex flex-col items-center min-w-[160px] min-h-[80px] justify-center">
              <span className="text-2xl font-bold text-green-800">{presentCount}</span>
              <span className="text-sm text-green-800 mt-1">Present</span>
            </div>
            <div className="bg-blue-100 rounded-lg px-6 py-4 flex flex-col items-center min-w-[160px] min-h-[80px] justify-center">
              <span className="text-2xl font-bold text-blue-800">{presentPercent}%</span>
              <span className="text-sm text-blue-800 mt-1">% Present</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        {/* Filters Card */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Search size={16} className="mr-1.5"/> Search Employee</label>
              <input 
                type="text" 
                id="search"
                placeholder="Name or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Building size={16} className="mr-1.5"/> Department</label>
              <select id="department" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {uniqueDepartments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="role" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Briefcase size={16} className="mr-1.5"/> Role</label>
              <select id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Filter size={16} className="mr-1.5"/> Status</label>
              <select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="All">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Not Marked">Not Marked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? "Today's Attendance"
              : `Attendance for ${format(new Date(selectedDate), 'MMMM do, yyyy')}`}
          </h2>
          <p className="text-sm text-neutral-500 mt-1 mb-4">
            {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
          </p>
        
          {loading ? (
            <div className="py-10 text-center text-neutral-500">Loading attendance...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="space-y-4">
                {currentEmployees.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">No records found.</div>
                ) : (
                  currentEmployees.map(emp => (
                    <div key={emp.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{emp.name} {emp.surname}</div>
                        <div className="text-sm text-neutral-500">{emp.email}</div>
                        <div className="text-sm text-neutral-500 mt-1">{emp.department} {emp.role}</div>
                      </div>
                      <div>
                        {emp.attendance_status ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.attendance_status === 'Present' ? 'bg-green-100 text-green-800' :
                            emp.attendance_status === 'Absent' ? 'bg-red-100 text-red-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {emp.attendance_status}
                          </span>
                        ) : (
                          isToday ? (
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                                onClick={() => handleMarkAttendance(emp.id, 'Present')}
                              >
                                Mark Present
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                                onClick={() => handleMarkAttendance(emp.id, 'Absent')}
                              >
                                Mark Absent
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-500">Not marked</span>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Pagination
                totalItems={filteredEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
