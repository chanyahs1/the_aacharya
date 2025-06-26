import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Squares2X2Icon,
  IdentificationIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  ListBulletIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  UserIcon,
  MapIcon,
  RectangleGroupIcon,
  CheckBadgeIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import Logo from "./ui/Logo";

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasUnreadMeetings, setHasUnreadMeetings] = useState(false);
  const [hasLeaveUpdates, setHasLeaveUpdates] = useState(false);
  const [hasNewTasks, setHasNewTasks] = useState(false);
  const [hasNewInterviews, setHasNewInterviews] = useState(false);
  const [hasPendingPunches, setHasPendingPunches] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  useEffect(() => {
    if (!currentEmployee) return;

    const isManager = [
      "Head of Department",
      "Area General Manager",
      "Senior Manager",
      "Manager",
    ].includes(currentEmployee.role);

    const fetchUnreadIndicators = async () => {
      try {
        const promises = [
          // fetch(
          //   `http://localhost:5000/api/employees/new-events/${currentEmployee.id}`
          // ),
          fetch(
            `https://the-aacharya.onrender.com/api/employees/notifications/unread-count/${currentEmployee.id}`
          ),
          fetch(
            `https://the-aacharya.onrender.com/api/messages/unread/${currentEmployee.id}`
          ),
          // fetch(
          //   `http://localhost:5000/api/leaves/unread-status-updates/${currentEmployee.id}`
          // ),
          // fetch(
          //   `http://localhost:5000/api/tasks/new-tasks-check/${currentEmployee.id}`
          // ),
        ];

        // if (isManager) {
        //   promises.push(
        //     fetch(
        //       `http://localhost:5000/api/interviews/new-interviews-check/${currentEmployee.id}`
        //     )
        //   );
        // }

        // if (currentEmployee.role === "Head of Department") {
        //   promises.push(
        //     fetch(`http://localhost:5000/api/salespunch/pending-approval-check`)
        //   );
        // }

        const responses = await Promise.all(promises);

        let currentIndex = 0;
        const calendarData = await responses[currentIndex++].json();
        setHasUnreadMeetings(calendarData.length > 0);

        const notifData = await responses[currentIndex++].json();
        setUnreadNotifications(notifData.count || 0);

        const messageData = await responses[currentIndex++].json();
        const totalMessages = messageData.reduce(
          (sum, row) => sum + row.unreadCount,
          0
        );
        setUnreadMessages(totalMessages);

        const leaveData = await responses[currentIndex++].json();
        setHasLeaveUpdates(leaveData.hasUpdates || false);

        const taskData = await responses[currentIndex++].json();
        setHasNewTasks(taskData.hasNewTasks || false);

        if (isManager) {
          const interviewData = await responses[currentIndex++].json();
          setHasNewInterviews(interviewData.hasNewInterviews || false);
        }

        if (currentEmployee.role === "Head of Department") {
          const punchData = await responses[currentIndex++].json();
          setHasPendingPunches(punchData.hasPending || false);
        }
      } catch (err) {
        console.error("Error fetching unread indicators:", err);
      }
    };

    fetchUnreadIndicators();
    const interval = setInterval(fetchUnreadIndicators, 5000);
    return () => clearInterval(interval);
  }, [currentEmployee]);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      let latitude = null;
      let longitude = null;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoErr) {
        console.warn("Geolocation failed:", geoErr.message);
      }

      const employeeRaw =
        localStorage.getItem("currentEmployee") ||
        sessionStorage.getItem("currentEmployee");
      const employee = employeeRaw ? JSON.parse(employeeRaw) : null;

      if (employee?.id) {
        await fetch(
          `https://the-aacharya.onrender.com/api/employees/logout/${employee.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          }
        );
      }
    } catch (err) {
      console.error("Logout failed", err.message);
    } finally {
      localStorage.removeItem("currentEmployee");
      localStorage.removeItem("token");
      sessionStorage.removeItem("currentEmployee");
      sessionStorage.removeItem("token");
      navigate("/employee-login", { replace: true });
    }
  };

  useEffect(() => {
    const raw =
      localStorage.getItem("currentEmployee") ||
      sessionStorage.getItem("currentEmployee");

    if (!raw || raw === "undefined") {
      navigate("/employee-login");
      return;
    }

    let employee;
    try {
      employee = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid employee JSON:", err);
      localStorage.removeItem("currentEmployee");
      sessionStorage.removeItem("currentEmployee");
      navigate("/employee-login");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("No token");

      const { exp } = jwtDecode(token);
      const now = Date.now();

      if (now >= exp * 1000) {
        handleLogout(raw.id);
      } else {
        setCurrentEmployee(employee);
        const timeout = exp * 1000 - now;
        const timer = setTimeout(() => {
          handleLogout();
        }, timeout);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Token decode error:", err);
      handleLogout();
    }
  }, [navigate]);

  if (!currentEmployee) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  const sidebarGroups = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", path: "/employee-dashboard", icon: Squares2X2Icon },
        {
          name: "Personal Details",
          path: "/employee-personal-details",
          icon: IdentificationIcon,
        },
        {
          name: "Calendar",
          path: "/employee-calendar",
          icon: CalendarIcon,
          notificationType: "meetings",
        },
        {
          name: "Notifications",
          path: "/employee-notifications",
          icon: BellIcon,
          notificationType: "notifications",
        },
        {
          name: "Messages",
          path: "/employee-messages",
          icon: EnvelopeIcon,
          notificationType: "messages",
        },
        {
          name: "Leave Request",
          path: "/employee-leave-request",
          icon: PaperAirplaneIcon,
          notificationType: "leave",
        },
      ],
    },
    {
      title: "MY WORK",
      items: [
        {
          name: "Current Tasks",
          path: "/employee-current-tasks",
          icon: ListBulletIcon,
          notificationType: "tasks",
        },
        {
          name: "Previous Tasks",
          path: "/employee-previous-tasks",
          icon: ArchiveBoxIcon,
        },
        {
          name: "Upcoming Tasks",
          path: "/employee-upcoming-tasks",
          icon: SparklesIcon,
        },
      ],
    },
  ];

  const managementItems = [];
  const myWorkItems = sidebarGroups.find((g) => g.title === "MY WORK").items;

  if (
    [
      "Head of Department",
      "Area General Manager",
      "Senior Manager",
      "Manager",
    ].includes(currentEmployee.role)
  ) {
    managementItems.push(
      {
        name: "Interviews",
        path: "/employee-interviews",
        icon: UserGroupIcon,
        notificationType: "interviews",
      },
      {
        name: "Assign Task",
        path: "/assign-task",
        icon: DocumentPlusIcon,
      },
      { name: "My Assignees", path: "/employee-my-assignees", icon: UserGroupIcon }
    );
  }

  if (
    currentEmployee.department === "Sales" &&
    !["Head of Department", "Senior Manager", "Area General Manager"].includes(
      currentEmployee.role
    )
  ) {
    myWorkItems.push(
      {
        name: "My Sales",
        path: "/my-sales",
        icon: ChartPieIcon,
      },
      {
        name: "My Sessions",
        path: "/my-sessions",
        icon: PresentationChartLineIcon,
      }
    );
  }

  if (currentEmployee.role !== "Head of Department") {
    myWorkItems.push({
      name: "My Supervisor",
      path: "/employee-my-supervisor",
      icon: UserIcon,
    });
  }
  
  if (currentEmployee.role === "Head of Department") {
    managementItems.push(
      { name: "All Employees", path: "/all-employees", icon: UsersIcon },
      { name: "Mapping", path: "/mapping", icon: MapIcon },
      {
        name: "Company Hierarchy",
        path: "/company-hierarchy",
        icon: RectangleGroupIcon,
      },
      {
        name: "Attendance",
        path: "/hod-attendance",
        icon: ClockIcon,
      }
    );
  }
  
  if (
    currentEmployee.role === "Head of Department" &&
    currentEmployee.department === "Sales"
  ) {
    managementItems.push({
      name: "Sales Punch Approval",
      path: "/sales-punch-approval",
      icon: CheckBadgeIcon,
      notificationType: "punches",
    });
  }

  if (
    [
      "Head of Department",
      "Area General Manager",
      "Senior Manager",
      "Manager",
    ].includes(currentEmployee.role) &&
    currentEmployee.department === "Sales"
  ) {
    managementItems.push(
      {
        name: "Sales Report",
        path: "/sales-report",
        icon: ChartBarIcon,
      },
      {
        name: "Direct Session",
        path: "/direct-session",
        icon: PresentationChartBarIcon,
      }
    );
  }

  if (managementItems.length > 0) {
    sidebarGroups.push({
      title: "MANAGEMENT",
      items: managementItems,
    });
  }

  return (
    <div className="flex h-screen bg-gray-100">
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
          {sidebarGroups.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.title} className="py-4">
                  <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {group.title}
                  </h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors duration-200 font-medium ${
                            isActive
                              ? "bg-blue-600 text-white shadow"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                          onClick={() => sidebarOpen && toggleSidebar()}
                        >
                          <item.icon
                            className={`w-5 h-5 mr-3 shrink-0 ${
                              item.name === "Leave Request" ? "-rotate-45" : ""
                            }`}
                          />
                          <span className="flex-grow">{item.name}</span>

                          {/* Notification Badges */}
                          {item.notificationType === "meetings" &&
                            hasUnreadMeetings && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                          {item.notificationType === "notifications" &&
                            unreadNotifications > 0 && (
                              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                {unreadNotifications}
                              </span>
                            )}
                          {item.notificationType === "messages" &&
                            unreadMessages > 0 && (
                              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                {unreadMessages}
                              </span>
                            )}
                          {item.notificationType === "leave" &&
                            hasLeaveUpdates && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                          {item.notificationType === "tasks" &&
                            hasNewTasks && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                          {item.notificationType === "interviews" &&
                            hasNewInterviews && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                          {item.notificationType === "punches" &&
                            hasPendingPunches && (
                              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )
          )}
        </div>
      </aside>

      <div className="flex flex-col flex-1 w-full overflow-hidden">
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
                  {currentEmployee?.name?.charAt(0)}
                  {currentEmployee?.surname?.charAt(0)}
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
                        {currentEmployee.name} {currentEmployee.surname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentEmployee.empID}
                      </p>
                    </div>
                    <div className="p-2">
                      <p className="px-2 py-1.5 text-xs text-gray-500">
                        {currentEmployee.role} - {currentEmployee.department}
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

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
