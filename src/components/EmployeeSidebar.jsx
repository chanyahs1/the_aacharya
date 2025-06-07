import React from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  CakeIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function EmployeeSidebar({ currentEmployee }) {
  const messages = [
    { from: 'HR', content: 'Your leave request has been approved', time: '2 hours ago' },
    { from: 'Manager', content: 'Team meeting at 3 PM today', time: '4 hours ago' }
  ];

  const tasks = [
    { title: 'Complete project documentation', deadline: '2024-01-20', status: 'Pending' },
    { title: 'Review code changes', deadline: '2024-01-18', status: 'In Progress' }
  ];

  const upcomingTasks = [
    { title: 'Team presentation', deadline: '2024-01-25', priority: 'High' },
    { title: 'Client meeting', deadline: '2024-01-22', priority: 'Medium' }
  ];

  return (
    <div className="w-80 bg-white border-l border-neutral-200 overflow-y-auto">
      {/* Personal Info Card */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-800">Personal Information</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center">
            <UserCircleIcon className="w-4 h-4 text-neutral-400 mr-2" />
            <div>
              <label className="text-xs text-neutral-500">Full Name</label>
              <p className="text-sm font-medium text-neutral-800">{currentEmployee.name} {currentEmployee.surname}</p>
            </div>
          </div>
          <div className="flex items-center">
            <CakeIcon className="w-4 h-4 text-neutral-400 mr-2" />
            <div>
              <label className="text-xs text-neutral-500">Age</label>
              <p className="text-sm font-medium text-neutral-800">{currentEmployee.age} years</p>
            </div>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="w-4 h-4 text-neutral-400 mr-2" />
            <div>
              <label className="text-xs text-neutral-500">Email</label>
              <p className="text-sm font-medium text-neutral-800">{currentEmployee.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <BriefcaseIcon className="w-4 h-4 text-neutral-400 mr-2" />
            <div>
              <label className="text-xs text-neutral-500">Role</label>
              <p className="text-sm font-medium text-neutral-800">{currentEmployee.role}</p>
            </div>
          </div>
          <div className="flex items-center">
            <CurrencyRupeeIcon className="w-4 h-4 text-neutral-400 mr-2" />
            <div>
              <label className="text-xs text-neutral-500">Salary</label>
              <p className="text-sm font-medium text-neutral-800">₹{currentEmployee.salary.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Card */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-neutral-800">Messages</h2>
          <span className="flex h-5 w-5 items-center justify-center bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
            {messages.length}
          </span>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-neutral-800">{message.from}</span>
                    <span className="text-xs text-neutral-500">{message.time}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar & Meetings */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-800">Upcoming Meetings</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-800">Team Weekly Sync</p>
                <p className="text-xs text-neutral-500">Today, 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-800">Project Review</p>
                <p className="text-xs text-neutral-500">Tomorrow, 11:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-800">Current Tasks</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-warning-100 rounded flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-warning-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-800">{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-neutral-500">Due: {task.deadline}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      task.status === 'Pending' ? 'bg-warning-100 text-warning-700' : 'bg-primary-100 text-primary-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-800">Upcoming Tasks</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                  <BellIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-800">{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-neutral-500">Due: {task.deadline}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-error-100 text-error-700' : 'bg-warning-100 text-warning-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="border-b border-neutral-200">
        <div className="bg-neutral-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-800">Attendance Overview</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-600">Present Days</span>
                <span className="text-xs font-medium text-neutral-800">22/24</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-success-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-600">Late Arrivals</span>
                  <span className="text-xs font-semibold text-warning-600">2</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1">
                  <div className="bg-warning-500 h-1 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div className="p-2 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-600">Early Leaves</span>
                  <span className="text-xs font-semibold text-error-600">1</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1">
                  <div className="bg-error-500 h-1 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 