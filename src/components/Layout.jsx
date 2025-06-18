import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  HomeIcon, ClipboardDocumentListIcon, CalendarIcon,
  Cog6ToothIcon, QuestionMarkCircleIcon, ChartBarIcon,
  BanknotesIcon, DocumentTextIcon, UsersIcon, UserPlusIcon,
  Bars3Icon, XMarkIcon, BellIcon, EnvelopeIcon,
  BriefcaseIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Logo from './ui/Logo';

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
  const navigate = useNavigate();
  const currentHR = JSON.parse(sessionStorage.getItem('currentHR'));

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

const handleLogout = async () => {
  try {
    await fetch(`http://localhost:5000/api/hr/logout/${currentHR.id}`, {
      method: 'PUT',
    });
  } catch (err) {
    console.error('Logout failed:', err);
  }

  sessionStorage.removeItem('currentHR');
  navigate('/hr-login');
};


  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
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

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
       <header className="z-10 py-3 bg-white border-b border-neutral-200">
  <div className="flex items-center justify-between px-4">
    <div className="flex items-center space-x-6">
      <button
        className="p-1 rounded-md lg:hidden hover:bg-neutral-100"
        onClick={toggleSidebar}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {currentHR && (
        <div className="flex flex-row text-lg text-primary-700 justify-end items-center gap-2">
      <h1 className="text-2xl font-semibold text-neutral-800">
        Welcome! 
      </h1>
      <h2>
        {currentHR.name} {currentHR.surname}
      </h2>
       <h2>
        {currentHR.department} {currentHR.role}
      </h2>
      </div>
      )}
    </div>

  <div className="flex items-center space-x-4">
  <button
    onClick={handleLogout}
    className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
  >
    Logout
  </button>
</div>

  </div>
</header>


        {/* Outlet content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
