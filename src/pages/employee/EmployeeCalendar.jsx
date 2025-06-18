import React from 'react';
import EmployeeCalendar from '../../components/EmployeeCalendar';

export default function EmployeeCalendarPage() {

   const currentEmployee =
    JSON.parse(localStorage.getItem('currentEmployee')) ||
    JSON.parse(sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }
  return (
  <div className="lg:col-span-2">
            <EmployeeCalendar employeeId={currentEmployee.id} />
          </div>
  );
}
