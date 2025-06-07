import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import DateRangePicker from '../components/payroll/DateRangePicker';
import PayrollNotification from '../components/payroll/PayrollNotification';
import MetricCard from '../components/payroll/MetricCard';
import PayrollChart from '../components/payroll/PayrollChart';
import BonusChart from '../components/payroll/BonusChart';
import PayrollTable from '../components/payroll/PayrollTable';
import Button from '../components/ui/Button';

export default function PayrollPage() {
  const [dateRange, setDateRange] = useState('01 July - 31 July 2024');
  const [showNotification, setShowNotification] = useState(true);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {showNotification && (
        <PayrollNotification onClose={() => setShowNotification(false)} />
      )}
      
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Export
          </Button>
          <Button 
            variant="primary"
            className="w-full sm:w-auto"
            icon={<PlusIcon />}
          >
            New Payroll
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Payrolls Cost"
          value="₹12,500"
          change="+20%"
          period="last month"
          type="cost"
        />
        <MetricCard
          title="Total Expense"
          value="₹2,560"
          change="+0.1%"
          period="last month"
          type="expense"
        />
        <MetricCard
          title="Pending payments"
          value="₹4,700"
          change="-50"
          additionalInfo="Total Employee"
          type="payment"
        />
        <MetricCard
          title="Total Payrolls"
          value="200"
          change="+10"
          additionalInfo="New Employee"
          type="count"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PayrollChart />
        </div>
        <div>
          <BonusChart />
        </div>
      </div>
      
      <PayrollTable />
    </motion.div>
  );
}