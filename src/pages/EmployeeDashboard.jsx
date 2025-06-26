import React, { useState, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CircleDollarSign,
  Calendar,
  CheckCircle,
  RefreshCw,
  XCircle,
  FilePlus,
  User,
  Badge,
  Bell,
  Users,
  MessageCircle
} from "lucide-react";

const StatCard = ({ title, value, icon, color, prefix = "" }) => {
    const countRef = useRef(null);

    useEffect(() => {
        const node = countRef.current;
        if (!node) return;

        const controls = animate(0, value || 0, {
            duration: 1.2,
            ease: "easeOut",
            onUpdate(latest) {
                node.textContent = `${prefix}${Math.round(latest).toLocaleString("en-IN")}`;
            }
        });

        return () => controls.stop();
    }, [value, prefix]);

    return (
      <div
        className={`bg-white p-5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${color}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p ref={countRef} className="text-3xl font-bold text-gray-800 mt-1">
              {prefix}0
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
        </div>
      </div>
    );
};

const ActionButton = ({ onClick, icon, text }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {icon}
    {text}
  </button>
);

const QuickLink = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 border-transparent hover:border-blue-500"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  </button>
);

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [salesStats, setSalesStats] = useState({ count: 0, revenue: 0 });
  const [sessionStats, setSessionStats] = useState({
    upcoming: 0,
    purchased: 0,
    followUp: 0,
    rejected: 0,
    refunded: 0,
  });

  const currentEmployee = JSON.parse(
    localStorage.getItem("currentEmployee") ||
      sessionStorage.getItem("currentEmployee")
  );

  const hasFetched = useRef(false); // prevent repeated fetching

  useEffect(() => {
    const fetchStats = async () => {
      if (currentEmployee?.department !== "Sales" || hasFetched.current) return;
      hasFetched.current = true;

      try {
        const [salesRes, sessionRes] = await Promise.all([
          fetch(`https://the-aacharya.onrender.com/api/employees/${currentEmployee.empID}/sales-stats`),
          fetch(`https://the-aacharya.onrender.com/api/employees/${currentEmployee.empID}/session-stats`)
        ]);

        if (!salesRes.ok || !sessionRes.ok) {
          throw new Error("Failed to fetch stats");
        }

        const salesData = await salesRes.json();
        const sessionData = await sessionRes.json();

        setSalesStats({
          count: salesData.salesCount || 0,
          revenue: salesData.totalRevenue || 0,
        });

        setSessionStats(sessionData);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load stats.");
      }
    };

    if (currentEmployee) {
      fetchStats();
    }
  }, [currentEmployee]);

  useEffect(() => {
    if (!currentEmployee) {
      navigate("/employee-login");
    }
  }, [currentEmployee, navigate]);

  if (!currentEmployee) {
    return null; // or a loading spinner
  }

  const quickLinks = [
    {
      title: "My Profile",
      description: "View personal details",
      icon: <User size={24} className="text-blue-500" />,
      path: "/employee-personal-details",
      show: true,
    },
    {
      title: "My Calendar",
      description: "Check your schedule",
      icon: <Calendar size={24} className="text-green-500" />,
      path: "/employee-calendar",
      show: true,
    },
    {
      title: "My Tasks",
      description: "View assigned tasks",
      icon: <CheckCircle size={24} className="text-purple-500" />,
      path: "/employee-current-tasks",
      show: true,
    },
    {
      title: "Leave Request",
      description: "Apply for time off",
      icon: <FilePlus size={24} className="text-orange-500" />,
      path: "/employee-leave-request",
      show: true,
    },
    {
      title: "Messages",
      description: "Check your messages",
      icon: <MessageCircle size={24} className="text-yellow-500" />,
      path: "/employee-messages",
      show: true,
    },
    {
      title: "Notifications",
      description: "Check your notifications",
      icon: <Bell size={24} className="text-red-500" />,
      path: "/employee-notifications",
      show: true,
    },
    {
      title: "My Sales",
      description: "Track your sales performance",
      icon: <TrendingUp size={24} className="text-indigo-500" />,
      path: "/my-sales",
      show: currentEmployee.department === "Sales" && (currentEmployee.role === "Intern" || currentEmployee.role === "Executive" || currentEmployee.role === "Associate" || currentEmployee.role === "Trainee" || currentEmployee.role === 'Manager'),
    },
     {
      title: "Team Sales",
      description: "Track your sales performance",
      icon: <TrendingUp size={24} className="text-indigo-500" />,
      path: "/sales-report",
      show: currentEmployee.department === "Sales" && (currentEmployee.role === "Manager" || currentEmployee.role === "Senior Manager" || currentEmployee.role === "Area General Manager" || currentEmployee.role === "Head of Department"),
    },
    {
      title: "My Sessions",
      description: "Manage your direct sessions",
      icon: <Users size={24} className="text-pink-500" />,
      path: "/my-sessions",
      show: currentEmployee.department === "Sales" && (currentEmployee.role === "Intern" || currentEmployee.role === "Executive" || currentEmployee.role === "Associate" || currentEmployee.role === "Trainee" || currentEmployee.role === 'Manager'),
    },
    {
      title: "Team Sessions",
      description: "Manage your direct sessions",
      icon: <Users size={24} className="text-pink-500" />,
      path: "/direct-session",
      show: currentEmployee.department === "Sales" && (currentEmployee.role === "Manager" || currentEmployee.role === "Senior Manager" || currentEmployee.role === "Area General Manager" || currentEmployee.role === "Head of Department"),
    },
  ].filter((link) => link.show);

  const salesStatCards = [
    {
      title: "Sales Count",
      value: salesStats.count,
      icon: <TrendingUp size={28} className="text-blue-500" />,
      color: "border-blue-500",
    },
    {
      title: "Sales Revenue",
      value: salesStats.revenue,
      prefix: "₹",
      icon: <CircleDollarSign size={28} className="text-green-500" />,
      color: "border-green-500",
    },
  ];

  const sessionStatCards = [
    {
      title: "Upcoming Sessions",
      value: sessionStats.upcoming,
      icon: <Calendar size={28} className="text-sky-500" />,
      color: "border-sky-500",
    },
    {
      title: "Purchased Sessions",
      value: sessionStats.purchased,
      icon: <CheckCircle size={28} className="text-emerald-500" />,
      color: "border-emerald-500",
    },
    {
      title: "Follow-Up Sessions",
      value: sessionStats.followUp,
      icon: <RefreshCw size={28} className="text-purple-500" />,
      color: "border-purple-500",
    },
    {
      title: "Rejected Sessions",
      value: sessionStats.rejected,
      icon: <XCircle size={28} className="text-red-500" />,
      color: "border-red-500",
    },
    {
      title: "Refunded Sessions",
      value: sessionStats.refunded,
      icon: <XCircle size={28} className="text-yellow-500" />,
      color: "border-yellow-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-9 h-9 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {currentEmployee.name} {currentEmployee.surname}!
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Badge size={16} /> {currentEmployee.empID} |{" "}
                {currentEmployee.department} - {currentEmployee.role}
              </p>
            </div>
          </div>
        </div>

     

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {currentEmployee?.onboarded === 0 && (
            <ActionButton
              onClick={() => navigate("/onboarding-form")}
              icon={<FilePlus size={20} />}
              text="Complete Onboarding Form"
            />
          )}

          {currentEmployee.department === "Sales" && (
            <>
              <ActionButton
                onClick={() => navigate("/sales-punch-form")}
                icon={<FilePlus size={20} />}
                text="Sales Punch Form"
              />
              <ActionButton
                onClick={() => navigate("/ds-form")}
                icon={<FilePlus size={20} />}
                text="Direct Session Form"
              />
            </>
          )}
        </div>

        {/* Sales Stats */}
        {currentEmployee.department === "Sales" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Sales Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {salesStatCards.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </div>
        )}

        {/* Session Stats */}
        {currentEmployee.department === "Sales" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">
              Session Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {sessionStatCards.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </div>
        )}

           {/* Quick Navigation */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <QuickLink
                key={link.title}
                title={link.title}
                description={link.description}
                icon={link.icon}
                onClick={() => navigate(link.path)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
