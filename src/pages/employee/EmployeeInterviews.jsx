import React from 'react';
import Interviews from '../../components/Interviews';

export default function EmployeeInterviewsPage() {
  const currentEmployee =
    JSON.parse(localStorage.getItem('currentEmployee')) ||
    JSON.parse(sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }

  return (
         <div className="lg:col-span-1">
            {currentEmployee && (
              <>
                {console.log('Rendering Interviews with employeeId:', currentEmployee?.id)}
                <Interviews employeeId={currentEmployee?.id} />
              </>
            )}
          </div>
  );

}
