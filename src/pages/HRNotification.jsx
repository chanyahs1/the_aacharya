import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import NotificationsPanel from '../components/NotificationsPanel'; // if this exists

export default function EmployeeNotificationsPage() {
  const currentEmployee =
    JSON.parse(localStorage.getItem('currentHR')) ||
    JSON.parse(sessionStorage.getItem('currentHR'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Bell className="w-9 h-9 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Notifications Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <NotificationsPanel employeeId={currentEmployee.id} />
        </div>
      </div>
    </motion.div>
  );
}
