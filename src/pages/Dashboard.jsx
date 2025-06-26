import React, { useEffect, useState, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BriefcaseIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, to, color, isLoading }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        sky: 'from-sky-500 to-sky-600',
        indigo: 'from-indigo-500 to-indigo-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        teal: 'from-teal-500 to-teal-600',
    };

    const countRef = useRef(null);

    useEffect(() => {
        if (isLoading || value === undefined || !countRef.current) return;
        
        const node = countRef.current;
        const controls = animate(0, value, {
            duration: 1.2,
            ease: "easeOut",
            onUpdate(latest) {
                if(node) {
                    node.textContent = Math.round(latest);
                }
            }
        });

        return () => controls.stop();
    }, [value, isLoading]);

    const cardContent = (
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg h-full flex flex-col justify-between`}>
            <div>
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 p-3 rounded-lg">
                        {React.cloneElement(icon, { className: "h-7 w-7" })}
                    </div>
                    {isLoading ? (
                         <div className="h-10 w-16 bg-white/20 rounded-md animate-pulse" />
                    ) : (
                        <p ref={countRef} className="text-5xl font-bold">0</p>
                    )}
                </div>
                <h3 className="text-xl font-semibold mt-4">{title}</h3>
            </div>
            <div className="flex items-center justify-end text-sm font-medium mt-4 opacity-80 hover:opacity-100 transition-opacity">
                View More <ArrowRightIcon className="w-4 h-4 ml-1" />
            </div>
        </div>
    );

    return (
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link to={to} className="block">
                {cardContent}
            </Link>
        </motion.div>
    );
};

const NavCard = ({ title, icon, to, description, color }) => {
    const colors = {
        blue: 'border-blue-500',
        sky: 'border-sky-500',
        indigo: 'border-indigo-500',
    };
    return (
        <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link to={to} className={`block p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow h-full border-l-4 ${colors[color]}`}>
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                        {React.cloneElement(icon, { className: "h-6 w-6 text-gray-700" })}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState({
        employees: 0,
        applications: 0,
        onboarding: 0,
        leaves: 0,
        tasks: 0,
    });
    const [loading, setLoading] = useState(true);
    const currentHR = JSON.parse(sessionStorage.getItem('currentHR'));
    const token = sessionStorage.getItem("token");

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            try {
                const endpoints = [
                    { name: 'employees', url: 'https://the-aacharya.onrender.com/api/employees' },
                    { name: 'applications', url: 'https://the-aacharya.onrender.com/api/applications' },
                    { name: 'onboarding', url: 'https://the-aacharya.onrender.com/api/employees/new/pendingForms' },
                    { name: 'leaves', url: 'https://the-aacharya.onrender.com/api/leaves/pending' },
                    { name: 'tasks', url: 'https://the-aacharya.onrender.com/api/employees/hr/tasks' }
                ];

                const responses = await Promise.all(
                    endpoints.map(e => fetch(e.url, { headers }))
                );

                const dataPromises = responses.map(async (res, index) => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`Error fetching ${endpoints[index].name}: Status ${res.status}`, errorText);
                        throw new Error(`Failed to fetch ${endpoints[index].name}`);
                    }
                    // Ensure response is JSON before parsing
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return res.json();
                    }
                    const errorText = await res.text();
                    console.error(`Error fetching ${endpoints[index].name}: Response was not JSON.`, errorText);
                    throw new Error(`Response for ${endpoints[index].name} was not JSON`);
                });

                const [employees, applications, onboarding, leaves, tasks] = await Promise.all(dataPromises);
                
                setStats({
                    employees: employees.length,
                    applications: applications.filter(a => a.status !== 'Hired' && a.status !== 'Rejected').length,
                    onboarding: onboarding.filter(f => f.onboarded === 2).length,
                    leaves: leaves.length,
                    tasks: tasks.filter(t => t.status !== 'Completed').length,
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    let dashboardCards = [
        { title: "Total Employees", value: stats.employees, icon: <UsersIcon/>, to: "/employees", color: "blue" },
        { title: "Open Applications", value: stats.applications, icon: <BriefcaseIcon/>, to: "/hiring", color: "sky" },
        { title: "Pending Onboarding", value: stats.onboarding, icon: <UserPlusIcon/>, to: "/onboarding-approvals", color: "indigo" },
        { title: "Leave Requests", value: stats.leaves, icon: <ExclamationCircleIcon/>, to: "/leave-requests", color: "purple" },
        { title: "Active Tasks", value: stats.tasks, icon: <ClipboardDocumentListIcon/>, to: "/tasks", color: "teal" },
    ];

    if (currentHR) {
        if (currentHR.role === 'Intern' || currentHR.role === 'Associate') {
            dashboardCards = dashboardCards.filter(card => 
                card.title === "Total Employees" || card.title === "Open Applications"
            );
        } else if (currentHR.role === 'Manager') {
            dashboardCards = dashboardCards.filter(card => card.title !== "Pending Onboarding");
        }
    }

    const navCards = [
        { title: "Calendar", description: "View and manage team schedule", icon: <CalendarIcon />, to: "/calendar", color: "blue" },
        { title: "Salary Management", description: "Process payroll and salaries", icon: <BanknotesIcon />, to: "/salary-management", color: "sky" },
        { title: "Performance", description: "Track employee performance", icon: <ChartBarIcon />, to: "/performance", color: "indigo" },
    ].filter(card => {
        if (card.title === "Salary Management") {
            return currentHR?.role === 'Head of Department';
        }
        return true;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <motion.div
              initial={{ opacity: 0}}
              animate={{ opacity: 1}}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentHR?.name}!</h1>
                    <p className="text-gray-600 mt-1">Here's a quick overview of your team's status.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                    {dashboardCards.map(card => (
                        <StatCard key={card.title} {...card} isLoading={loading} />
                    ))}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {navCards.map(card => (
                            <NavCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>

            </motion.div>
        </div>
    );
}