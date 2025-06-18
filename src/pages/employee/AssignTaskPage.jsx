import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import TaskModal from '../../components/TaskModal';



export default function AssignTaskPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async (currentEmployee) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/tasks/creator/${currentEmployee.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedEmployee = JSON.parse(
      localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee')
    );
    setCurrentEmployee(storedEmployee);

    if (storedEmployee) {
      console.log('Stored employee:', storedEmployee);
      fetchTasks(storedEmployee);
      fetchEmployees(storedEmployee);
    }
  }, []);

  const fetchEmployees = async (currentEmployee) => {
    try {
      const url = `http://localhost:5000/api/employees/hierarchy/${encodeURIComponent(currentEmployee.role)}?department=${encodeURIComponent(currentEmployee.department)}`;
      console.log('API URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      console.log('Fetched employees:', data);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };
  const handleCreateTask = async (taskData) => {
    // Always get the latest employee info
    const currentEmployee = JSON.parse(
      localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee')
    );
    const createdBy = currentEmployee?.id;
  
    if (!createdBy) {
      alert('Employee not logged in.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/employees/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          priority: taskData.priority,
          assigneeId: parseInt(taskData.assigneeId, 10),
          createdBy: createdBy
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
  
      await fetchTasks(currentEmployee);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Assign Tasks</h1>
        <Button 
          variant="primary" 
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Task
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50 border-y border-neutral-200">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assignee
                </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assignee Remark
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-50">
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-sm font-medium text-neutral-900">{task.title}</span>
                        {task.description && (
                          <p className="text-sm text-neutral-500 mt-1">{task.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-600">{formatDate(task.due_date)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${task.priority === 'High' ? 'bg-error-100 text-error-800' :
                          task.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                            'bg-success-100 text-success-800'
                        }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${task.status === 'Completed' ? 'bg-success-100 text-success-800' :
                          task.status === 'In Progress' ? 'bg-primary-100 text-primary-800' :
                            'bg-warning-100 text-warning-800'
                        }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900">
                          {task.assignee_name} {task.assignee_surname}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {task.assignee_department} {task.assignee_role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900">
                          {task.assignee_remarks}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 px-6 text-center text-neutral-500">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        employees={employees}
      />
    </motion.div>
  );
} 