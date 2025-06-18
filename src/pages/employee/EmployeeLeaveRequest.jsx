import React from 'react';
import LeaveManagement from '../../components/LeaveManagement'; // if you have this

export default function EmployeeLeaveRequestPage() {


  const currentEmployee =
    JSON.parse(localStorage.getItem('currentEmployee')) ||
    JSON.parse(sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }
  return (
         <div className="lg:col-span-1">
             <LeaveManagement employeeId={currentEmployee?.id} />
           </div>
  );
}
