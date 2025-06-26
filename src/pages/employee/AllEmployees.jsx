import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, DollarSign, MapPin, CheckCircle, XCircle, Clock, Search, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import ReportModal from '../../components/ReportModal';

export default function AllEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
    if (!currentEmployee || !currentEmployee.department) {
      setError('Could not determine your department.');
      setLoading(false);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`https://the-aacharya.onrender.com/api/employees/department/${encodeURIComponent(currentEmployee.department)}`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleOpenReportModal = (employee) => {
    setSelectedEmployee(employee);
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setSelectedEmployee(null);
    setIsReportModalOpen(false);
  };

  const uniqueRoles = Array.from(new Set(employees.map(emp => emp.role)));

  const filteredEmployees = employees.filter(emp => {
    const roleMatch = roleFilter ? emp.role === roleFilter : true;
    const searchMatch = nameFilter
      ? `${emp.name} ${emp.surname}`.toLowerCase().includes(nameFilter.toLowerCase()) ||
        String(emp.empID).toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    return roleMatch && searchMatch;
  });

  const tableHeaders = [
    'EmpID', 'Name', 'Department', 'Role', 'Salary', 'Status', 'Last Login','Report'
  ];
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Department Employees</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Filters Card */}
        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="nameFilter" className="flex items-center text-md font-medium text-gray-700 mb-1">
              <Search size={18} className="mr-2" />
              Search by Name or ID:
            </label>
            <input
              type="text"
              id="nameFilter"
              placeholder="Search by name or ID..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="roleFilter" className="flex items-center text-md font-medium text-gray-700 mb-1">
              <Filter size={18} className="mr-2" />
              Filter by Role:
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp, index) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.empID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name} {emp.surname}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                        <IndianRupee size={16} className="text-green-500" />
                        {emp.salary ? emp.salary.toLocaleString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {emp.isActive ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        {emp.lastLogin ? format(new Date(emp.lastLogin), 'PPpp') : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {emp.loginLatitude && emp.loginLongitude ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${emp.loginLatitude},${emp.loginLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {`${emp.loginLatitude}, ${emp.loginLongitude}`}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleOpenReportModal(emp)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all text-sm font-medium"
                        >
                          Report
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
      {isReportModalOpen && selectedEmployee && (
        <ReportModal
          employee={selectedEmployee}
          onClose={handleCloseReportModal}
        />
      )}
    </motion.div>
  );
} 