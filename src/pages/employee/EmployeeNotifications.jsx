import React from 'react';
import NotificationBell from '../../components/NotificationBell'; // adjust this to your actual file
import NotificationsPanel from '../../components/NotificationsPanel'; // if this exists

export default function EmployeeNotificationsPage() {

   const currentEmployee =
    JSON.parse(localStorage.getItem('currentEmployee')) ||
    JSON.parse(sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }
  return (
  <div className="lg:col-span-1">
            <NotificationsPanel employeeId={currentEmployee.id} />
          </div>
  );
}
