import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  CakeIcon
} from '@heroicons/react/24/outline';
import EmployeeCalendar from '../components/EmployeeCalendar';
import NotificationBell from '../components/NotificationBell';
import NotificationsPanel from '../components/NotificationsPanel';
import Interviews from '../components/Interviews';
import LeaveManagement from '../components/LeaveManagement';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ current: [], upcoming: [], previous: [] });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  // Function to handle task status updates
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Force fetch tasks to update the UI
      await fetchTasks(true);
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status. Please try again.');
    }
  };

  // Function to fetch tasks with debouncing
  const fetchTasks = async (force = false) => {
    const now = Date.now();
    // Don't fetch if less than 5 seconds have passed since last fetch, unless forced
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    try {
      setError(null);
      console.log('Fetching tasks for employee:', currentEmployee.id);
      
      const response = await fetch(`http://localhost:5000/api/employees/${currentEmployee.id}/tasks`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Tasks fetched successfully');
      
      // Sort tasks by due date and status
      const sortedTasks = data.sort((a, b) => {
        // First sort by status (Pending first)
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        // Then sort by due date
        return new Date(a.due_date) - new Date(b.due_date);
      });

      // Separate tasks into current, upcoming, and previous
      const currentDate = new Date();
      const currentTasks = sortedTasks.filter(task => 
        // Show tasks that are either:
        // 1. Due today or overdue AND not completed
        // 2. In Progress (regardless of due date)
        ((new Date(task.due_date) <= currentDate && task.status !== 'Completed') ||
        task.status === 'In Progress') && task.status !== 'Completed'
      );
      
      const upcomingTasks = sortedTasks.filter(task => 
        // Show tasks that are:
        // 1. Due in the future
        // 2. Not in progress or completed
        new Date(task.due_date) > currentDate && 
        task.status !== 'In Progress' &&
        task.status !== 'Completed'
      );

      const previousTasks = sortedTasks.filter(task =>
        // Show all completed tasks
        task.status === 'Completed'
      );

      setTasks({
        current: currentTasks,
        upcoming: upcomingTasks,
        previous: previousTasks
      });
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      setTasks({ current: [], upcoming: [], previous: [] });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!currentEmployee) {
      navigate('/employee-login');
      return;
    }
    
    console.log('Current employee in dashboard:', currentEmployee);
    
    // Initial fetch
    fetchTasks(true);

    // Remove periodic fetch
  }, [currentEmployee, navigate]);

  const handleLogout = async () => {
    if (!currentEmployee || !currentEmployee.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/employees/logout/${currentEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('currentEmployee');
      navigate('/employee-login');
    } catch (err) {
      console.error(err.message);
      alert('Failed to logout. Please try again.');
    }
  };

  if (!currentEmployee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Add Employee Name Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">
          Welcome, {currentEmployee.name} {currentEmployee.surname}
        </h1>
        <p className="mt-2 text-neutral-600">
          {currentEmployee.role}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <EmployeeCalendar employeeId={currentEmployee.id} />
        </div>
        <div className="lg:col-span-1">
          <NotificationsPanel employeeId={currentEmployee.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Management Section */}
        <div className="lg:col-span-1">
          <LeaveManagement employeeId={currentEmployee?.id} />
        </div>

        {/* Interviews Section */}
        <div className="lg:col-span-1">
          {currentEmployee && (
            <>
              {console.log('Rendering Interviews with employeeId:', currentEmployee?.id)}
              <Interviews employeeId={currentEmployee?.id} />
            </>
          )}
        </div>

        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Tasks */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Current Tasks</h2>
            <div className="space-y-4">
              {isInitialLoading ? (
                <p className="text-neutral-500 text-center py-4">Loading tasks...</p>
              ) : tasks.current.length > 0 ? (
                tasks.current.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    <h3 className="font-medium text-neutral-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-neutral-500 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-neutral-500">
                        Due: {formatDate(task.due_date)}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2
                          ${task.status === 'Completed' ? 'bg-success-100 text-success-800 focus:ring-success-500' :
                            task.status === 'In Progress' ? 'bg-primary-100 text-primary-800 focus:ring-primary-500' :
                            'bg-warning-100 text-warning-800 focus:ring-warning-500'
                          }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No current tasks</p>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Upcoming Tasks</h2>
            <div className="space-y-4">
              {isInitialLoading ? (
                <p className="text-neutral-500 text-center py-4">Loading tasks...</p>
              ) : tasks.upcoming.length > 0 ? (
                tasks.upcoming.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    <h3 className="font-medium text-neutral-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-neutral-500 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-neutral-500">
                        Due: {formatDate(task.due_date)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full
                          ${task.priority === 'High' ? 'bg-error-100 text-error-800' :
                            task.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                            'bg-success-100 text-success-800'}
                        `}>
                          {task.priority}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2
                            ${task.status === 'Completed' ? 'bg-success-100 text-success-800 focus:ring-success-500' :
                              task.status === 'In Progress' ? 'bg-primary-100 text-primary-800 focus:ring-primary-500' :
                              'bg-warning-100 text-warning-800 focus:ring-warning-500'
                            }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* Previous Tasks */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Previous Tasks</h2>
            <div className="space-y-4">
              {isInitialLoading ? (
                <p className="text-neutral-500 text-center py-4">Loading tasks...</p>
              ) : tasks.previous.length > 0 ? (
                tasks.previous.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    <h3 className="font-medium text-neutral-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-neutral-500 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-neutral-500">
                        Due: {formatDate(task.due_date)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full
                          ${task.priority === 'High' ? 'bg-error-100 text-error-800' :
                            task.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                            'bg-success-100 text-success-800'}
                        `}>
                          {task.priority}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-success-100 text-success-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No completed tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}