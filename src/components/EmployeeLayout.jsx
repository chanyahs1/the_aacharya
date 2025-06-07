import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    navigate('/employee-login');
    return null;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/logout/${currentEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      // Clear both storage options
      localStorage.removeItem('currentEmployee');
      sessionStorage.removeItem('currentEmployee');
      
      // Navigate to login page
      navigate('/employee-login', { replace: true });
    } catch (err) {
      console.error(err.message);
      // Even if the API call fails, clear storage and redirect
      localStorage.removeItem('currentEmployee');
      sessionStorage.removeItem('currentEmployee');
      navigate('/employee-login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with logout */}
      <header className="bg-white border-b border-neutral-200 px-6 py-3">
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}