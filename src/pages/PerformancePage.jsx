import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState({
    teamPerformance: {
      current: { productivity: 0, quality: 0, teamwork: 0 },
      changes: { productivity: 0, quality: 0, teamwork: 0 }
    },
    employeeMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load performance data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-neutral-600">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-error-600">{error}</div>
      </div>
    );
  }

  const { teamPerformance, employeeMetrics } = performanceData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Performance Overview</h1>
        <p className="text-neutral-600 mt-1">Track and manage employee performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Team Productivity</h3>
          <div className="text-3xl font-bold text-neutral-900 mb-2">
            {teamPerformance.current.productivity}%
          </div>
          <div className={`flex items-center ${
            parseFloat(teamPerformance.changes.productivity) >= 0 
              ? 'text-success-600' 
              : 'text-error-600'
          }`}>
            {parseFloat(teamPerformance.changes.productivity) >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm">
              {Math.abs(teamPerformance.changes.productivity)}% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Team Quality</h3>
          <div className="text-3xl font-bold text-neutral-900 mb-2">
            {teamPerformance.current.quality}%
          </div>
          <div className={`flex items-center ${
            parseFloat(teamPerformance.changes.quality) >= 0 
              ? 'text-success-600' 
              : 'text-error-600'
          }`}>
            {parseFloat(teamPerformance.changes.quality) >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm">
              {Math.abs(teamPerformance.changes.quality)}% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Team Teamwork</h3>
          <div className="text-3xl font-bold text-neutral-900 mb-2">
            {teamPerformance.current.teamwork}%
          </div>
          <div className={`flex items-center ${
            parseFloat(teamPerformance.changes.teamwork) >= 0 
              ? 'text-success-600' 
              : 'text-error-600'
          }`}>
            {parseFloat(teamPerformance.changes.teamwork) >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm">
              {Math.abs(teamPerformance.changes.teamwork)}% vs last month
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Employee Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Productivity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Teamwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {employeeMetrics.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {employee.name} {employee.surname}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {employee.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-neutral-900">{employee.metrics.productivity}%</span>
                      <div className="ml-2 w-24 h-2 bg-neutral-200 rounded-full">
                        <div
                          className="h-2 bg-primary-500 rounded-full"
                          style={{ width: `${employee.metrics.productivity}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-neutral-900">{employee.metrics.quality}%</span>
                      <div className="ml-2 w-24 h-2 bg-neutral-200 rounded-full">
                        <div
                          className="h-2 bg-primary-500 rounded-full"
                          style={{ width: `${employee.metrics.quality}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-neutral-900">{employee.metrics.teamwork}%</span>
                      <div className="ml-2 w-24 h-2 bg-neutral-200 rounded-full">
                        <div
                          className="h-2 bg-primary-500 rounded-full"
                          style={{ width: `${employee.metrics.teamwork}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {employee.totalTasks} tasks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${employee.status === 'Excellent' ? 'bg-success-100 text-success-800' :
                        employee.status === 'Good' ? 'bg-primary-100 text-primary-800' :
                          'bg-warning-100 text-warning-800'}`}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}