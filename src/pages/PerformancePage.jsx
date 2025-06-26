import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon, StarIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 8;

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState({
    teamPerformance: {
      current: { productivity: 0, quality: 0, teamwork: 0 },
      changes: { productivity: 0, quality: 0, teamwork: 0 }
    },
    employeeMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('https://the-aacharya.onrender.com/api/employees/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const { teamPerformance, employeeMetrics } = performanceData;

  const { uniqueDepartments, uniqueRoles } = useMemo(() => ({
    uniqueDepartments: [...new Set(employeeMetrics.map(e => e.department).filter(Boolean))],
    uniqueRoles: [...new Set(employeeMetrics.map(e => e.role).filter(Boolean))]
  }), [employeeMetrics]);

  const filteredEmployees = useMemo(() => {
    setCurrentPage(1);
    return employeeMetrics.filter(emp => 
      (!selectedDepartment || emp.department === selectedDepartment) &&
      (!selectedRole || emp.role === selectedRole) &&
      (!searchTerm ||
        `${emp.name} ${emp.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.empID && emp.empID.toString().toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [employeeMetrics, selectedDepartment, selectedRole, searchTerm]);
  
  const filteredAverages = useMemo(() => {
    if (filteredEmployees.length === 0) return { productivity: 0, quality: 0, teamwork: 0 };
    return {
      productivity: (filteredEmployees.reduce((sum, e) => sum + (parseFloat(e.metrics.productivity) || 0), 0) / filteredEmployees.length).toFixed(1),
      quality: (filteredEmployees.reduce((sum, e) => sum + (parseFloat(e.metrics.quality) || 0), 0) / filteredEmployees.length).toFixed(1),
      teamwork: (filteredEmployees.reduce((sum, e) => sum + (parseFloat(e.metrics.teamwork) || 0), 0) / filteredEmployees.length).toFixed(1),
    };
  }, [filteredEmployees]);

  const showFilteredStats = selectedDepartment || selectedRole || searchTerm;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            <h1 className="text-3xl font-bold text-gray-900">Performance Overview</h1>
            <p className="text-gray-600 mt-1">Track and manage employee performance metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<ChartBarIcon />}
            title="Team Productivity"
            value={showFilteredStats ? filteredAverages.productivity : teamPerformance.current.productivity}
            change={teamPerformance.changes.productivity}
            isLoading={loading}
            isFiltered={showFilteredStats}
            filteredCount={filteredEmployees.length}
            color="blue"
          />
          <StatCard
            icon={<StarIcon />}
            title="Team Quality"
            value={showFilteredStats ? filteredAverages.quality : teamPerformance.current.quality}
            change={teamPerformance.changes.quality}
            isLoading={loading}
            isFiltered={showFilteredStats}
            filteredCount={filteredEmployees.length}
            color="green"
          />
          <StatCard
            icon={<UsersIcon />}
            title="Team Teamwork"
            value={showFilteredStats ? filteredAverages.teamwork : teamPerformance.current.teamwork}
            change={teamPerformance.changes.teamwork}
            isLoading={loading}
            isFiltered={showFilteredStats}
            filteredCount={filteredEmployees.length}
            color="yellow"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full" />
            <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
              <option value="">All Roles</option>
              {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            {(searchTerm || selectedRole || selectedDepartment) && (
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-2 border border-gray-300" onClick={() => { setSearchTerm(""); setSelectedRole(""); setSelectedDepartment(""); }}>
                <XMarkIcon className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Employee Performance Details</h2>
            <p className="text-sm text-gray-500 mt-1">{showFilteredStats ? `Showing ${filteredEmployees.length} employee(s) matching your criteria.` : `Showing all ${employeeMetrics.length} employees.`}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Productivity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quality</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teamwork</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (<tr><td colSpan="6" className="py-12 px-6 text-center text-gray-500">Loading...</td></tr>)
                : error ? (<tr><td colSpan="6" className="py-12 px-6 text-center text-red-500">{error}</td></tr>)
                : paginatedEmployees.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 px-6 text-center text-gray-500">
                    <h3 className="text-lg font-medium">No employees found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your filters.</p>
                  </td></tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{employee.name} {employee.surname}</div><div className="text-sm text-gray-500">{employee.department} - {employee.role}</div></td>
                      <td className="px-6 py-4"><MetricBar value={employee.metrics.productivity} /></td>
                      <td className="px-6 py-4"><MetricBar value={employee.metrics.quality} /></td>
                      <td className="px-6 py-4"><MetricBar value={employee.metrics.teamwork} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.totalTasks}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={employee.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length > ITEMS_PER_PAGE && <div className="p-4 border-t border-gray-200"><Pagination currentPage={currentPage} totalItems={filteredEmployees.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} /></div>}
        </div>
      </div>
    </motion.div>
  );
}

const StatCard = ({ icon, title, value, change, isLoading, isFiltered, filteredCount, color }) => {
  const colors = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  };
  const changeIsPositive = parseFloat(change) >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colors[color].bg} ${colors[color].text}`}>{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
        {!isFiltered && (
          <div className={`flex items-center text-sm ${changeIsPositive ? 'text-green-600' : 'text-red-600'}`}>
            {changeIsPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        {isLoading ? <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse mt-1" /> : <p className="text-3xl font-bold text-gray-900">{value}%</p>}
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xs text-gray-500 mt-1">
          {isFiltered ? `Filtered average (${filteredCount} employees)` : `Company-wide average vs. last month`}
        </p>
      </div>
    </div>
  );
};

const MetricBar = ({ value }) => {
  const colors = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center">
      <span className="text-sm font-semibold text-gray-800 w-10">{value}%</span>
      <div className="ml-2 w-full h-2.5 bg-gray-200 rounded-full"><div className={`h-2.5 rounded-full ${colors}`} style={{ width: `${value}%` }}></div></div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    'Outstanding': 'bg-green-100 text-green-800',
    'Excellent': 'bg-emerald-100 text-emerald-800',
    'Very Good': 'bg-blue-100 text-blue-800',
    'Good': 'bg-sky-100 text-sky-800',
    'Average': 'bg-yellow-100 text-yellow-800',
    'Needs Improvement': 'bg-red-100 text-red-800'
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Previous</button>
        <button onClick={() => onPageChange(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};