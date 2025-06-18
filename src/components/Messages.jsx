import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import EmployeeScheduleMeet from './EmployeeScheduleMeet';

export default function Messages({ employeeId }) {
  const [messages, setMessages] = useState([]);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScheduleMeetOpen, setIsScheduleMeetOpen] = useState(false);
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  useEffect(() => {
    if (currentEmployee?.department) {
      fetchDepartmentEmployees();
    } else {
      setError('Department information not available');
      setIsLoading(false);
    }

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentEmployee?.department]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchMessages();
    }
  }, [selectedEmployee]);

  const fetchDepartmentEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/employees/department/${currentEmployee.department}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch department employees');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const filteredEmployees = data.filter(emp => emp.id !== currentEmployee.id);
      setDepartmentEmployees(filteredEmployees);
    } catch (error) {
      console.error('Error fetching department employees:', error);
      setError(error.message || 'Failed to load department employees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${currentEmployee.id}/${selectedEmployee.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedEmployee) return;

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: currentEmployee.id,
          receiver_id: selectedEmployee.id,
          message: newMessage.trim(),
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setMessages(prevMessages => [...prevMessages, data]);
      setNewMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!currentEmployee?.department) {
    return (
      <div className="text-center py-4 text-red-500">
        Department information not available. Please contact HR.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading department members...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={fetchDepartmentEmployees}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex"
    >
      {/* Employee List */}
      <div className="w-1/4 border-r border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Department Members</h2>
          <p className="text-sm text-neutral-500 mt-1">{currentEmployee.department}</p>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-12rem)]">
          {departmentEmployees.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              No other employees in your department
            </div>
          ) : (
            departmentEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors duration-200 ${
                  selectedEmployee?.id === employee.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {employee.name.charAt(0)}{employee.surname.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      {employee.name} {employee.surname}
                    </p>
                    <p className="text-xs text-neutral-500">{employee.role}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmployee ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {selectedEmployee.name.charAt(0)}{selectedEmployee.surname.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      {selectedEmployee.name} {selectedEmployee.surname}
                    </p>
                    <p className="text-xs text-neutral-500">{selectedEmployee.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentEmployee.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === currentEmployee.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {message.meet_link && (
                      <div className="mt-2 pt-2 border-t border-opacity-20">
                        <a
                          href={message.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline hover:opacity-80"
                        >
                          Join Meeting
                        </a>
                        {message.meet_remarks && (
                          <p className="text-xs mt-1 opacity-80">{message.meet_remarks}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            Select an employee to start chatting
          </div>
        )}
      </div>

      {/* Optional modal (not used if you're not scheduling meets now) */}
      {isScheduleMeetOpen && (
        <EmployeeScheduleMeet
          employeeId={currentEmployee.id}
          onClose={() => setIsScheduleMeetOpen(false)}
        />
      )}
    </motion.div>
  );
}
