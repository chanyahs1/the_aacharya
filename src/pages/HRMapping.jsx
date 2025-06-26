import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitMerge, User, MapPin, Save, Trash2, Search } from 'lucide-react';

const ROLE_HIERARCHY = [
  "Intern/Trainee/Associate/Executive",
  "Manager",
  "Senior Manager",
  "Area General Manager",
  "Head of Department",
];

export default function Mapping() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapping, setMapping] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentEmployee =
      JSON.parse(localStorage.getItem("currentHR")) ||
      JSON.parse(sessionStorage.getItem("currentHR"));

    if (!currentEmployee || !currentEmployee.department) {
      setError("Could not determine your department.");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `https://the-aacharya.onrender.com/api/employees/department/${encodeURIComponent(
            currentEmployee.department
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);

        // Prefill mapping if supervisor is already assigned
        const initialMapping = {};
        data.forEach((emp) => {
          if (emp.assigned_supervisor) {
            initialMapping[emp.id] = emp.assigned_supervisor;
          }
        });
        setMapping(initialMapping);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const employeesByRole = {
    "Intern/Trainee/Associate/Executive": employees.filter(
      (emp) =>
        emp.role === "Associate" ||
        emp.role === "Executive" ||
        emp.role === "Intern" ||
        emp.role === "Trainee"
    ),
    Manager: employees.filter((emp) => emp.role === "Manager"),
    "Senior Manager": employees.filter((emp) => emp.role === "Senior Manager"),
    "Area General Manager": employees.filter(
      (emp) => emp.role === "Area General Manager"
    ),
    "Head of Department": employees.filter(
      (emp) => emp.role === "Head of Department"
    ),
  };

  const getSupervisors = (role) => {
    const idx = ROLE_HIERARCHY.indexOf(role);
    if (idx === -1 || idx === ROLE_HIERARCHY.length - 1) return [];
    return employeesByRole[ROLE_HIERARCHY[idx + 1]] || [];
  };

  const handleMappingChange = (empId, supervisorId) => {
    setMapping((prev) => ({ ...prev, [empId]: supervisorId }));
  };

  const handleSaveMapping = async (empId) => {
    const supervisorId = mapping[empId];
    if (!supervisorId) {
      alert("Please select a supervisor before saving.");
      return;
    }

    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${empId}/assign-supervisor`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supervisorId }),
        }
      );
      if (!res.ok) throw new Error("Failed to update supervisor mapping");
      alert("Supervisor assigned successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  const handleResetMapping = async (empId) => {
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${empId}/assign-supervisor`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supervisorId: null }),
        }
      );
      if (!res.ok) throw new Error("Failed to reset supervisor");
      setMapping((prev) => {
        const updated = { ...prev };
        delete updated[empId];
        return updated;
      });
      alert("Supervisor reset successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const currentEmployee = JSON.parse(localStorage.getItem('currentHR') || sessionStorage.getItem('currentHR'));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <GitMerge className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Hierarchy Mapping</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Search Card */}
        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-md mb-6">
          <label htmlFor="search-mapping" className="flex items-center text-md font-medium text-gray-700 mb-1">
            <Search size={18} className="mr-2" />
            Search Employees
          </label>
          <input
            id="search-mapping"
            type="text"
            placeholder="Search by name or Employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-8">
            {ROLE_HIERARCHY.slice(0, -1).map((role) => {
                const roleEmployees = employeesByRole[role];
                if (!roleEmployees || roleEmployees.length === 0) return null;

                const lowercasedQuery = searchQuery.toLowerCase();
                const filteredEmployees = searchQuery
                  ? roleEmployees.filter(emp =>
                      `${emp.name} ${emp.surname}`.toLowerCase().includes(lowercasedQuery) ||
                      (emp.empID && String(emp.empID).toLowerCase().includes(lowercasedQuery))
                    )
                  : roleEmployees;

                return (
                  <motion.div
                    key={role}
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {role.replace(/\//g, ' / ')}s
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Assign supervisors from the <span className="font-semibold">{ROLE_HIERARCHY[ROLE_HIERARCHY.indexOf(role) + 1]}</span> level.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Employee</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Assign Supervisor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                      <User size={20} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{emp.name} {emp.surname}</p>
                                      <p className="text-sm text-gray-500">{emp.empID} | {emp.role}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    {emp.district}, {emp.state}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={mapping[emp.id] || ""}
                                      onChange={(e) =>
                                        handleMappingChange(emp.id, e.target.value)
                                      }
                                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select Supervisor...</option>
                                      {getSupervisors(role).map((supervisor) => (
                                        <option
                                          key={supervisor.id}
                                          value={supervisor.id}
                                        >
                                          {supervisor.name} {supervisor.surname}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleSaveMapping(emp.id)}
                                      className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
                                      aria-label="Save"
                                    >
                                      <Save size={20} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to reset the supervisor?")) {
                                          handleResetMapping(emp.id);
                                        }
                                      }}
                                      className="p-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
                                      aria-label="Reset"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                                No employees found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
