import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Mar', cost: 3000, expense: 2400 },
  { name: 'Apr', cost: 4100, expense: 3500 },
  { name: 'May', cost: 5500, expense: 4200 },
  { name: 'Jun', cost: 4500, expense: 3800 },
  { name: 'Jul', cost: 8740, expense: 6700 },
  { name: 'Aug', cost: 3900, expense: 3100 },
  { name: 'Sep', cost: 5000, expense: 4000 },
  { name: 'Oct', cost: 4200, expense: 3500 },
  { name: 'Nov', cost: 6000, expense: 4800 },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-neutral-200 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PayrollChart() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">Payroll Cost Overview</h3>
        <button className="text-sm text-primary-600 hover:text-primary-800">
          More details
        </button>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barGap={0}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={tick => `₹${tick/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingTop: 20 }}
            />
            <Bar dataKey="cost" name="Cost" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-neutral-50 rounded-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-700">₹8,740.00</span>
            <span className="text-sm text-success-600">↑ 51.3%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-700">₹2,110.00</span>
            <span className="text-sm text-success-600">↑ 12.1%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}