import React, { useEffect, useState } from 'react';

export default function EmployeePersonalDetails() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
    console.log('Current Employee:', currentEmployee);
    if (!currentEmployee || !currentEmployee.id) {
      setError('No employee found.');
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/api/employees/${currentEmployee.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch employee details');
        return res.json();
      })
      .then(data => {
        setEmployee(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!employee) return null;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Personal Details</h2>
      <div className="mb-2"><strong>Name:</strong> {employee.name} {employee.surname}</div>
      <div className="mb-2"><strong>Employee ID:</strong> {employee.empID}</div>
      <div className="mb-2"><strong>Email:</strong> {employee.email}</div>
      <div className="mb-2"><strong>Role:</strong> {employee.role}</div>
      <div className="mb-2"><strong>Department:</strong> {employee.department}</div>
      {/* Add more fields as needed */}
    </div>
  );
} 