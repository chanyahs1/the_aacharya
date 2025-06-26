import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  UsersIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Logo from "./ui/Logo";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentHR = JSON.parse(sessionStorage.getItem("currentHR"));
  const profileMenuRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);
  const rawSidebarItems = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
        { name: "Calendar", path: "/calendar", icon: CalendarIcon },
        { name: "Tasks", path: "/tasks", icon: ClipboardDocumentListIcon },
        {
          name: "Leave Requests",
          path: "/leave-requests",
          icon: ExclamationCircleIcon,
        },
      ],
    },
    {
      title: "TEAM MANAGEMENT",
      items: [
        { name: "Attendance", path: "/attendance", icon: DocumentTextIcon },
        {
          name: "Salary Management",
          path: "/salary-management",
          icon: BanknotesIcon,
        },
        { name: "Performance", path: "/performance", icon: ChartBarIcon },
        { name: "Employees", path: "/employees", icon: UsersIcon },
        { name: "Hiring", path: "/hiring", icon: BriefcaseIcon },
        { name: "Add New Employee", path: "/add-employee", icon: UserPlusIcon },
        {
          name: "Onboarding Approvals",
          path: "/onboarding-approvals",
          icon: UsersIcon,
        },
      ],
    },
    {
      title: "MY WORK",
      items: [
        {
          name: "Personal Details",
          path: "/personal-details",
          icon: DocumentTextIcon,
        },
        { name: "Notifications", path: "/notifications", icon: BellIcon },
        { name: "Messages", path: "/messages", icon: MagnifyingGlassIcon },
        {
          name: "Leave Request",
          path: "/my-leave-requests",
          icon: ExclamationCircleIcon,
        },
        {
          name: "Current Tasks",
          path: "/my-current-tasks",
          icon: ClipboardDocumentListIcon,
        },
        {
          name: "Upcoming Tasks",
          path: "/my-upcoming-tasks",
          icon: CalendarIcon,
        },
        {
          name: "Previous Tasks",
          path: "/my-previous-tasks",
          icon: ClipboardDocumentListIcon,
        },
        {
          name: "Assign Tasks",
          path: "/assign-tasks",
          icon: ClipboardDocumentListIcon,
        },
        { name: "My Assignees", path: "/my-assignees", icon: UsersIcon },
        { name: "My Supervisor", path: "/my-supervisor", icon: UsersIcon },
        { name: "Interviews", path: "/my-interviews", icon: BriefcaseIcon },
        {
          name: "Mapping",
          path: "/my-mapping",
          icon: ClipboardDocumentListIcon,
        },
        {
          name: "Company Hierarchy",
          path: "/my-company-hierarchy",
          icon: UsersIcon,
        },
        { name: "All Employees", path: "/my-all-employees", icon: UsersIcon },
      ],
    },
  ];

  const filterSidebarItemsByRole = (role) => {
    return rawSidebarItems.map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (["Intern", "Associate"].includes(role)) {
          return [
            "Dashboard",
            "Calendar",
            "Performance",
            "Employees",
            "Hiring",
            "Personal Details",
            "Notifications",
            "Messages",
            "Leave Request",
            "Current Tasks",
            "Upcoming Tasks",
            "Previous Tasks",
            "My Supervisor",
          ].includes(item.name);
        }
        if (role === "Manager") {
          return ![
            "Salary Management",
            "Add New Employee",
            "Mapping",
            "Company Hierarchy",
            "All Employees",
          ].includes(item.name);
        }
        return true; // Default for HOD, HR, etc.
      });

      return { ...section, items: filteredItems };
    });
  };

  const sidebarItems = filterSidebarItemsByRole(currentHR?.role || "");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      await fetch(`https://the-aacharya.onrender.com/api/hr/logout/${currentHR.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoutLatitude: latitude,
          logoutLongitude: longitude,
        }),
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
      sessionStorage.removeItem("currentHR");
      navigate("/hr-login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-30 flex flex-col w-64 bg-white border-r border-gray-200 transform lg:translate-x-0 lg:static lg:z-auto transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 shrink-0">
          <Logo />
          <button
            className="p-1 rounded-md lg:hidden text-gray-500 hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {sidebarItems.map((group, groupIndex) => (
            <div key={groupIndex} className="py-4">
              <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors duration-200 font-medium ${
                        isActive
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span>{item.name}</span>
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
        <header className="relative z-10 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button
              className="p-1 -ml-2 rounded-md lg:hidden text-gray-600 hover:bg-gray-100"
              onClick={toggleSidebar}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block ml-4">
              Employee Management System
            </h1>
          </div>

          <div className="flex items-center space-x-5">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2"
              >
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentHR?.name?.charAt(0)}
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border overflow-hidden"
                  >
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-800">
                        {currentHR.name} {currentHR.surname}
                      </p>
                      <p className="text-sm text-gray-500">{currentHR.email}</p>
                    </div>
                    <div className="p-2">
                      <p className="px-2 py-1.5 text-xs text-gray-500">
                        {currentHR.role} - {currentHR.department}
                      </p>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-2 py-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span>Logout</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Outlet content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
