import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AllEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  

  useEffect(() => {
    const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
    if (!currentEmployee || !currentEmployee.department) {
      setError('Could not determine your department.');
      setLoading(false);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/employees/department/${encodeURIComponent(currentEmployee.department)}`);
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

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(employees.map(emp => emp.role)));


  // Filter employees by selected role
  const filteredEmployees = roleFilter
    ? employees.filter(emp => emp.role === roleFilter)
    : employees;
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">All Employees in Your Department</h1>
      {loading ? (
        <p className="text-neutral-600">Loading...</p>
      ) : error ? (
        <p className="text-error-600">{error}</p>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <label htmlFor="roleFilter" className="text-sm font-medium text-neutral-700">Filter by Role:</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">EmpID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Surname</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Login Location</th>


                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.empID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.surname}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.salary}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(emp.lastLogin).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{emp.loginLatitude} {emp.loginLongitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
} 