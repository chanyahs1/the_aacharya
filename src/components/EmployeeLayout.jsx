import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';


const sidebarItems = [
  { name: 'Dashboard', path: '/employee-dashboard', icon: ClipboardDocumentListIcon },
  { name: 'Personal Details', path: '/employee-personal-details', icon: ClipboardDocumentListIcon },
  { name: 'Calendar', path: '/employee-calendar', icon: CalendarIcon },
  { name: 'Notifications', path: '/employee-notifications', icon: BellIcon },
  { name: 'Messages', path: '/employee-messages', icon: ClipboardDocumentListIcon },
  { name: 'Current Tasks', path: '/employee-current-tasks', icon: ClockIcon },
  { name: 'Previous Tasks', path: '/employee-previous-tasks', icon: ExclamationCircleIcon },
  { name: 'Upcoming Tasks', path: '/employee-upcoming-tasks', icon: CheckCircleIcon },
  { name: 'Leave Request', path: '/employee-leave-request', icon: CheckCircleIcon }

];

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    navigate('/employee-login');
    return null;
  }

  const handleLogout = async () => {
    try {
      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const res = await fetch(`http://localhost:5000/api/employees/logout/${currentEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      // Clear both storage options
      localStorage.removeItem('currentEmployee');
      sessionStorage.removeItem('currentEmployee');
      
      // Navigate to login page
      navigate('/employee-login', { replace: true });
    } catch (err) {
      console.error(err.message);
      // Even if the API call fails, clear storage and redirect
      localStorage.removeItem('currentEmployee');
      sessionStorage.removeItem('currentEmployee');
      navigate('/employee-login', { replace: true });
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Conditionally add Sales Punch Form for Sales department
  let sidebarItemsCustom = sidebarItems;

if (
  currentEmployee &&
  ['Head of Department','Area General Manager', 'Senior Manager', 'Manager'].includes(currentEmployee.role)
) {
  sidebarItemsCustom = [
    ...sidebarItemsCustom,
  { name: 'Interviews', path: '/employee-interviews', icon: BriefcaseIcon },
  { name: 'Assign Task', path: '/assign-task', icon: ClipboardDocumentListIcon },
  { name: 'My Assignees', path: '/employee-my-assignees', icon: UsersIcon },
  ];
}

  if (currentEmployee && currentEmployee.department === 'Sales' && currentEmployee.role != 'Head of Department' && currentEmployee.role != 'Senior Manager' && currentEmployee.role != 'Area General Manager') {
    sidebarItemsCustom = [
      ...sidebarItemsCustom,
      { name: 'My Sales', path: '/my-sales', icon: ClipboardDocumentListIcon },
      { name: 'My Sessions', path: '/my-sessions', icon: ClipboardDocumentListIcon }
    ];
  }
  if (currentEmployee && currentEmployee.role != 'Head of Department' ) {
    sidebarItemsCustom = [
      ...sidebarItemsCustom,
       { name: 'My Supervisor', path: '/employee-my-supervisor', icon: UsersIcon }

    ];
  }
  // Conditionally add All Employees and Mapping for Head Of Department
  if (currentEmployee && currentEmployee.role === 'Head of Department') {
    sidebarItemsCustom = [
      ...sidebarItemsCustom,
      { name: 'All Employees', path: '/all-employees', icon: UsersIcon },
      { name: 'Mapping', path: '/mapping', icon: ClipboardDocumentListIcon },
      { name: 'Employee Hierarchy', path: '/employee-hierarchy', icon: UsersIcon },
      { name: 'Direct Sessions', path: '/direct-session', icon: ClipboardDocumentListIcon }
    ];
  }
  // Conditionally add Sales Punch Approval for Sales Head of Department
  if (currentEmployee && currentEmployee.role === 'Head of Department' && currentEmployee.department === 'Sales') {
    sidebarItemsCustom = [
      ...sidebarItemsCustom,
      { name: 'Sales Punch Approval', path: '/sales-punch-approval', icon: ClipboardDocumentListIcon },
      { name: 'Sales Report', path: '/sales-report', icon: ClipboardDocumentListIcon }
    ];
  }
if (
  currentEmployee &&
  ['Area General Manager', 'Senior Manager', 'Manager'].includes(currentEmployee.role) &&
  currentEmployee.department === 'Sales'
) {
  sidebarItemsCustom = [
    ...sidebarItemsCustom,
    { name: 'Sales Report', path: '/sales-report', icon: ClipboardDocumentListIcon },
    { name: 'Direct Session', path: '/direct-session', icon: ClipboardDocumentListIcon }
  ];
}




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
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-md">
              <img src="/logoo.png" alt="" />
            </div>
            <span className="ml-2 text-xl font-bold text-neutral-900">The Aacharya</span>
          </div>
          <button
            className="p-1 rounded-md lg:hidden hover:bg-neutral-100"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Employee Info */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {currentEmployee.name.charAt(0)}{currentEmployee.surname.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900">
                {currentEmployee.name} {currentEmployee.surname}
              </p>
              <p className="text-xs text-neutral-500">{currentEmployee.role}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-grow overflow-y-auto">
          <nav className="py-4">
            {sidebarItemsCustom.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
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
              <h1 className="text-xl font-semibold text-neutral-800">Employee Portal</h1>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}