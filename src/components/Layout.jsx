import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  HomeIcon, ClipboardDocumentListIcon, CalendarIcon, 
  Cog6ToothIcon, QuestionMarkCircleIcon, ChartBarIcon,
  BanknotesIcon, DocumentTextIcon, UsersIcon, UserPlusIcon,
  Bars3Icon, XMarkIcon, BellIcon, EnvelopeIcon,
  BriefcaseIcon, CalendarDaysIcon, 
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Logo from './ui/Logo'

const sidebarItems = [
  { 
    title: 'MAIN MENU', 
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
      { name: 'Tasks', path: '/tasks', icon: ClipboardDocumentListIcon },
      { name: 'Leave Requests', path: '/leave-requests', icon: ExclamationCircleIcon },
      { name: 'FAQs', path: '/faqs', icon: Cog6ToothIcon },
    ]
  },
  {
    title: 'TEAM MANAGEMENT',
    items: [
      { name: 'Attendance', path: '/attendance', icon: DocumentTextIcon },
      { name: 'Salary Management', path: '/salary-management', icon: BanknotesIcon },
      { name: 'Performance', path: '/performance', icon: ChartBarIcon },
      { name: 'Employees', path: '/employees', icon: UsersIcon },
      { name: 'Hiring', path: '/hiring', icon: BriefcaseIcon },
      { name: 'Add New Employee', path: '/add-employee', icon: UserPlusIcon },


    ]
  }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 z-30 flex flex-col w-64 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <Logo />
          <button
            className="p-1 rounded-md lg:hidden hover:bg-neutral-100"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {sidebarItems.map((group, groupIndex) => (
            <div key={groupIndex} className="py-4">
              <h3 className="px-4 mb-1 text-xs font-semibold tracking-wider text-neutral-500">
                {group.title}
              </h3>
              <nav>
                {group.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors duration-200 ${
                        isActive 
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <header className="z-10 py-3 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <button
                className="p-1 mr-4 rounded-md lg:hidden hover:bg-neutral-100"
                onClick={toggleSidebar}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-neutral-800">Employee Management System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-64 py-2 pl-10 pr-4 bg-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Notifications */}
              <button className="p-1 text-neutral-500 rounded-md hover:bg-neutral-100">
                <EnvelopeIcon className="w-6 h-6" />
              </button>
              
              {/* Notifications */}
              <button className="p-1 text-neutral-500 rounded-md hover:bg-neutral-100">
                <BellIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}