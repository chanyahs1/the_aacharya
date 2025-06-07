import React, { useState } from 'react';
import { format } from 'date-fns';
import { MagnifyingGlassIcon, ChevronDownIcon, EyeIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const payrollData = [
  {
    id: 'PYRL120124',
    employee: { 
      name: 'Roohi',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=60',
      role: { title: 'UI/UX Designer', level: 'Lead' }
    },
    date: new Date('2024-06-21T17:05:00'),
    salary: 2500.00,
    reimbursement: 500.00,
    status: 'Completed'
  },
  {
    id: 'PYRL120124',
    employee: { 
      name: 'Shyam',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
      role: { title: 'UI/UX Designer', level: 'Sr' }
    },
    date: new Date('2024-06-21T17:03:00'),
    salary: 2300.00,
    reimbursement: 100.00,
    status: 'Completed'
  },
  {
    id: 'PYRL120124',
    employee: { 
      name: 'Priya',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
      role: { title: 'Graphics Designer', level: 'Jr' }
    },
    date: new Date('2024-06-21T17:01:00'),
    salary: 2000.00,
    reimbursement: 1000.00,
    status: 'Pending'
  },
  {
    id: 'PYRL120124',
    employee: { 
      name: 'Meena',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60',
      role: { title: 'Animator', level: 'Jr' }
    },
    date: new Date('2024-06-21T17:00:00'),
    salary: 2100.00,
    reimbursement: 500.00,
    status: 'Pending'
  },
  {
    id: 'PYRL120124',
    employee: { 
      name: 'Krish',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60',
      role: { title: 'UI/UX Designer', level: 'Sr' }
    },
    date: new Date('2024-06-21T17:03:00'),
    salary: 2300.00,
    reimbursement: 100.00,
    status: 'Completed'
  }
];

export default function PayrollTable() {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(payrollData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-semibold text-neutral-800">Payroll list</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Employee"
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button className="btn-outline">
              All Status
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>
            
            <button className="btn-outline">
              All Role
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full">
          <thead className="bg-neutral-50 border-y border-neutral-200">
            <tr>
              <th className="py-3 px-6 text-left">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  onChange={handleSelectAll}
                  checked={selectedRows.length === payrollData.length}
                />
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  Payroll ID
                  {getSortIcon('id')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('employee')}
              >
                <div className="flex items-center">
                  Employee name
                  {getSortIcon('employee')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  Role
                  {getSortIcon('role')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date & Time
                  {getSortIcon('date')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('salary')}
              >
                <div className="flex items-center">
                  Total Salary
                  {getSortIcon('salary')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('reimbursement')}
              >
                <div className="flex items-center">
                  Reimbursement
                  {getSortIcon('reimbursement')}
                </div>
              </th>
              <th 
                className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {payrollData.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-neutral-50 transition-colors duration-150"
              >
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
                <td className="py-4 px-6 text-sm font-medium text-neutral-900">
                  {row.id}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <img
                      src={row.employee.avatar}
                      alt={row.employee.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="text-sm font-medium text-neutral-900">{row.employee.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-neutral-800">
                  <span className="font-medium">{row.employee.level} </span>
                  {row.employee.role.title}
                </td>
                <td className="py-4 px-6 text-sm text-neutral-800">
                  {format(row.date, "dd MMM, yyyy - hh:mm aaa")}
                </td>
                <td className="py-4 px-6 text-sm font-medium text-neutral-900">
                  {formatCurrency(row.salary)}
                </td>
                <td className="py-4 px-6 text-sm text-neutral-800">
                  {formatCurrency(row.reimbursement)}
                </td>
                <td className="py-4 px-6">
                  <span className={`status-badge ${
                    row.status === 'Completed' ? 'status-completed' : 'status-pending'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button className="text-primary-600 hover:text-primary-900">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="text-neutral-400 hover:text-neutral-700">
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}