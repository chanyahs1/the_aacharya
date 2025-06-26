import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function EmployeeCurrentTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ current: [], upcoming: [], previous: [] });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [remarkInput, setRemarkInput] = useState('');

  const currentEmployee = JSON.parse(
    localStorage.getItem('currentEmployee') ||
    sessionStorage.getItem('currentEmployee')
  );

  useEffect(() => {
    fetchTasks(true);
  }, []);

const handleUpdateTaskStatus = async (taskId, newStatus) => {
  try {
    const response = await fetch(`https://the-aacharya.onrender.com/api/employees/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task status');
    }

    await fetchTasks(true);
  } catch (error) {
    console.error('Error updating task status:', error);
    setError('Failed to update task status. Please try again.');
  }
};

const handleSaveRemark = async (taskId) => {
  try {
    const response = await fetch(`https://the-aacharya.onrender.com/api/employees/tasks/${taskId}/remarks`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignee_remarks: remarkInput }),
    });

    if (!response.ok) {
      throw new Error('Failed to save remark');
    }

    setEditingRemarkId(null);
    setRemarkInput('');
    await fetchTasks(true);
  } catch (error) {
    console.error('Error saving remark:', error);
    setError('Failed to save remark. Please try again.');
  }
};


  const fetchTasks = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) return;

    try {
      setError(null);
      const response = await fetch(`https://the-aacharya.onrender.com/api/employees/${currentEmployee?.id}/tasks`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      const sortedTasks = data.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(a.due_date) - new Date(b.due_date);
      });

      const currentDate = new Date();

      const currentTasks = sortedTasks.filter(
        (task) =>
          ((new Date(task.due_date) <= currentDate && task.status !== 'Completed') ||
            task.status === 'In Progress') &&
          task.status !== 'Completed'
      );

      const upcomingTasks = sortedTasks.filter(
        (task) =>
          new Date(task.due_date) > currentDate &&
          task.status !== 'In Progress' &&
          task.status !== 'Completed'
      );

      const previousTasks = sortedTasks.filter((task) => task.status === 'Completed');

      setTasks({ current: currentTasks, upcoming: upcomingTasks, previous: previousTasks });
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      setTasks({ current: [], upcoming: [], previous: [] });
    } finally {
      setIsInitialLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <ListChecks className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Current Tasks</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Tasks Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
                        ${task.status === 'Completed'
                          ? 'bg-green-100 text-green-800 focus:ring-green-500'
                          : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 focus:ring-blue-500'
                            : 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                        }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="mt-3">
                    {editingRemarkId === task.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border border-neutral-300 rounded-md p-2 text-sm"
                          placeholder="Enter your remark"
                          value={remarkInput}
                          onChange={(e) => setRemarkInput(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveRemark(task.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingRemarkId(null);
                              setRemarkInput('');
                            }}
                            className="text-sm text-neutral-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {task.assignee_remarks && (
                          <p className="text-sm text-neutral-600 mt-1">
                            <strong>Remark:</strong> {task.assignee_remarks}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setEditingRemarkId(task.id);
                            setRemarkInput(task.assignee_remarks || '');
                          }}
                          className="text-blue-600 hover:underline text-sm mt-2"
                        >
                          {task.assignee_remarks ? 'Edit Remark' : 'Add Remark'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No current tasks</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
