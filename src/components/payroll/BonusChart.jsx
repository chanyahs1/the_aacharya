import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const data = [
  { name: 'Bonuses', value: 5100, color: '#3B82F6' },
  { name: 'Incentives', value: 5400, color: '#34D399' },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function BonusChart() {
  const [isOpen, setIsOpen] = useState(false);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">Bonuses and Incentives</h3>
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md hover:bg-neutral-100"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-neutral-500" />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 z-10 w-48 mt-2 bg-white border rounded-md shadow-lg">
              <ul className="py-1">
                <li>
                  <button className="w-full px-4 py-2 text-left hover:bg-neutral-100">
                    View details
                  </button>
                </li>
                <li>
                  <button className="w-full px-4 py-2 text-left hover:bg-neutral-100">
                    Export report
                  </button>
                </li>
                <li>
                  <button className="w-full px-4 py-2 text-left hover:bg-neutral-100">
                    Print
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                borderRadius: '8px', 
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E5E7EB'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <p className="text-sm font-medium text-neutral-500">Totals</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </div>
      
      <div className="mt-4 space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="font-semibold">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full py-2 text-center text-primary-600 border border-primary-300 rounded-md hover:bg-primary-50">
          More details
        </button>
      </div>
    </motion.div>
  );
}