import React, { useEffect, useState } from 'react';

export default function SalaryManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy payment handler (replace with real payment logic if needed)
  const handlePaySalary = (employeeId) => {
    alert(`Salary paid to employee ID: ${employeeId}`);
    // Here you could call a backend endpoint to mark salary as paid
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-800 mb-6">Salary Management</h2>
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No employees found.</td></tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{emp.name} {emp.surname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{emp.department} {emp.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{emp.salary?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      onClick={() => handlePaySalary(emp.id)}
                    >
                      Pay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 