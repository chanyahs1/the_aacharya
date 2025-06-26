import React from 'react';
import { motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import LeaveManagement from '../components/LeaveManagement'; // if you have this

export default function EmployeeLeaveRequestPage() {
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
          <div className="bg-red-100 p-3 rounded-full">
            <CalendarX className="w-9 h-9 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Leave Management Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <LeaveManagement employeeId={currentEmployee?.id} />
        </div>
      </div>
    </motion.div>
  );
}
