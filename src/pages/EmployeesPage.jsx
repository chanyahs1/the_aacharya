import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { EyeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      if (res.ok) {
        const data = await res.json();
        // Add isActive flag based on lastLogin/lastLogout timestamps
        const employeesWithStatus = data.map(emp => ({
          ...emp,
          isActive: emp.lastLogin && (!emp.lastLogout || new Date(emp.lastLogout) < new Date(emp.lastLogin))
        }));
        setEmployees(employeesWithStatus);
      } else {
        console.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleLogout = async (employeeId) => {
    try {
      const now = new Date().toISOString();
      // Call backend to update logout time
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'PATCH', // or PUT depending on your API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastLogout: now }),
      });

      if (res.ok) {
        // Update local state immediately after successful update
        setEmployees((prev) =>
          prev.map(emp =>
            emp._id === employeeId
              ? { ...emp, lastLogout: now, isActive: false }
              : emp
          )
        );
      } else {
        console.error('Failed to update logout');
      }
    } catch (error) {
      console.error('Error updating logout:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading employees...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Employee List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Logout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-neutral-500">
                    No employees found.
                  </td>
                </tr>
              )}
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {employee.empID}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {employee.name} {employee.surname}
                        </div>
                        <div className="text-sm text-neutral-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.lastLogin ? format(new Date(employee.lastLogin), 'dd MMM yyyy HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.lastLogout ? format(new Date(employee.lastLogout), 'dd MMM yyyy HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-primary-600 hover:text-primary-900">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {employee.isActive && (
                        <button 
                          onClick={() => handleLogout(employee._id)}
                          className="text-neutral-600 hover:text-neutral-900"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
