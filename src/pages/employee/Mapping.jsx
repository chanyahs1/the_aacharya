import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const currentEmployee =
      JSON.parse(localStorage.getItem("currentEmployee")) ||
      JSON.parse(sessionStorage.getItem("currentEmployee"));

    if (!currentEmployee || !currentEmployee.department) {
      setError("Could not determine your department.");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/employees/department/${encodeURIComponent(
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
        `http://localhost:5000/api/employees/${empId}/assign-supervisor`,
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
        `http://localhost:5000/api/employees/${empId}/assign-supervisor`,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl p-6"
    >
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">
        Employee Hierarchy Mapping
      </h1>
      {loading ? (
        <p className="text-neutral-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {ROLE_HIERARCHY.slice(0, -1).map((role) =>
            employeesByRole[role] && employeesByRole[role].length > 0 ? (
              <div key={role} className="mb-8">
                <h2 className="text-lg font-semibold text-neutral-800 mb-2">
                  {role}s
                </h2>
                <div className="">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          EmpID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Area
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Assign Supervisor (
                          {ROLE_HIERARCHY[ROLE_HIERARCHY.indexOf(role) + 1]})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {employeesByRole[role].map((emp) => (
                        <tr key={emp.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {emp.empID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {emp.name} {emp.surname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {emp.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {emp.district}, {emp.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            <select
                              value={mapping[emp.id] || ""}
                              onChange={(e) =>
                                handleMappingChange(emp.id, e.target.value)
                              }
                              className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">
                                Select{" "}
                                {
                                  ROLE_HIERARCHY[
                                    ROLE_HIERARCHY.indexOf(role) + 1
                                  ]
                                }
                              </option>
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
                              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              OK
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to reset the supervisor?"
                                  )
                                ) {
                                  handleResetMapping(emp.id);
                                }
                              }}
                              className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              Reset
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null
          )}
        </>
      )}
    </motion.div>
  );
}
