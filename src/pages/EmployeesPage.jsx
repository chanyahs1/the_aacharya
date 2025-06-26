import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  UserCircleIcon,
  AtSymbolIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  KeyIcon,
  TrashIcon,
  PowerIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 8;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editDetails, setEditDetails] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [currentHR, setCurrentHR] = useState(null);

  useEffect(() => {
    const hrData = sessionStorage.getItem("currentHR");
    if (hrData) {
      setCurrentHR(JSON.parse(hrData));
    }
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://the-aacharya.onrender.com/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      const employeesWithStatus = data.map((emp) => ({
        ...emp,
        isActive:
          emp.lastLogin &&
          (!emp.lastLogout ||
            new Date(emp.lastLogout) < new Date(emp.lastLogin)),
      }));
      setEmployees(employeesWithStatus);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const { uniqueRoles, uniqueDepartments } = useMemo(
    () => ({
      uniqueRoles: [...new Set(employees.map((e) => e.role).filter(Boolean))],
      uniqueDepartments: [
        ...new Set(employees.map((e) => e.department).filter(Boolean)),
      ],
    }),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    setCurrentPage(1);
    return employees.filter((employee) => {
      const fullName = `${employee.name} ${employee.surname}`;
      const empID = employee.empID || "";
      return (
        (fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empID.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedRole || employee.role === selectedRole) &&
        (!selectedDepartment || employee.department === selectedDepartment)
      );
    });
  }, [employees, searchTerm, selectedRole, selectedDepartment]);

  const { activeNowCount, enabledCount, disabledCount } = useMemo(
    () => ({
      activeNowCount: filteredEmployees.filter((e) => e.isActive).length,
      enabledCount: filteredEmployees.filter((e) => !e.is_disable).length,
      disabledCount: filteredEmployees.filter((e) => e.is_disable).length,
    }),
    [filteredEmployees]
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewDetails = async (employeeId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setShowDetailsModal(true);
    setIsEditingDetails(false);
    setEditDetails({});
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/lol/${employeeId}`
      );
      if (!res.ok) throw new Error("Failed to fetch employee details");
      setSelectedEmployeeDetails(await res.json());
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditDetails = () => {
    setEditDetails(selectedEmployeeDetails);
    setIsEditingDetails(true);
    setEditError(null);
  };

  const handleEditChange = (e) => {
    setEditDetails({ ...editDetails, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${selectedEmployeeDetails.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editDetails),
        }
      );
      if (!res.ok) throw new Error("Failed to update employee details");
      setSelectedEmployeeDetails({
        ...selectedEmployeeDetails,
        ...editDetails,
      });
      setIsEditingDetails(false);
      fetchEmployees();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditingDetails(false);
    setEditDetails({});
    setEditError(null);
  };

  const handleToggleDisable = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          employee.is_disable ? "enable" : "disable"
        } ${employee.name}?`
      )
    )
      return;
    setActionLoading((prev) => ({ ...prev, [employee.id]: true }));
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${employee.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_disable: !employee.is_disable }),
        }
      );
      if (!res.ok) throw new Error("Failed to update employee status");
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [employee.id]: false }));
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to DELETE ${employee.name}? This action is irreversible.`
      )
    )
      return;
    setActionLoading((prev) => ({ ...prev, [employee.id]: true }));
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${employee.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete employee");
      fetchEmployees();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [employee.id]: false }));
    }
  };

  const canPerformActions =
    currentHR?.role === "Manager" || currentHR?.role === "Head of Department";
  const numColumns = canPerformActions ? 8 : 7;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              View, manage, and edit employee details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<UsersIcon />}
            title="Total Employees"
            value={filteredEmployees.length}
            color="blue"
            isLoading={loading}
          />
          <StatCard
            icon={<ClipboardDocumentCheckIcon />}
            title="Active Now"
            value={activeNowCount}
            color="green"
            isLoading={loading}
          />
          <StatCard
            icon={<PowerIcon />}
            title="Enabled Accounts"
            value={enabledCount}
            color="teal"
            isLoading={loading}
          />
          <StatCard
            icon={<XMarkIcon />}
            title="Disabled Accounts"
            value={disabledCount}
            color="red"
            isLoading={loading}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
            />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {(searchTerm || selectedRole || selectedDepartment) && (
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-2 border border-gray-300"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("");
                  setSelectedDepartment("");
                }}
              >
                <XMarkIcon className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Login Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Logout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Logout Location
                  </th>
                  {canPerformActions && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={numColumns}
                      className="py-12 px-6 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={numColumns}
                      className="py-12 px-6 text-center text-gray-500"
                    >
                      <h3 className="text-lg font-medium">
                        No Employees Found
                      </h3>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {employee.name} {employee.surname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.empID}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.department}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {employee.isActive ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.lastLogin
                          ? format(
                              new Date(employee.lastLogin),
                              "dd MMM yyyy, HH:mm"
                            )
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.loginLatitude && employee.loginLongitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${employee.loginLatitude},${employee.loginLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.lastLogout
                          ? format(
                              new Date(employee.lastLogout),
                              "dd MMM yyyy, HH:mm"
                            )
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.logoutLatitude && employee.logoutLongitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${employee.logoutLatitude},${employee.logoutLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>

                      {canPerformActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600"
                              title="View Details"
                              onClick={() => handleViewDetails(employee.id)}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              className={`p-2 rounded-full hover:bg-gray-100 ${
                                employee.is_disable
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                              title={
                                employee.is_disable ? "Enable" : "Disable"
                              }
                              onClick={() => handleToggleDisable(employee)}
                              disabled={actionLoading[employee.id]}
                            >
                              <PowerIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600"
                              title="Delete"
                              onClick={() => handleDeleteEmployee(employee)}
                              disabled={actionLoading[employee.id]}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEmployees.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden"
          >
            <div className="p-6">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                onClick={() => setShowDetailsModal(false)}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              {detailsLoading ? (
                <div className="text-center p-8">Loading details...</div>
              ) : detailsError ? (
                <div className="text-red-500 p-8">{detailsError}</div>
              ) : selectedEmployeeDetails ? (
                <div>
                  <div className="flex justify-between items-start mb-6 pb-4 border-b">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedEmployeeDetails.name}{" "}
                        {selectedEmployeeDetails.surname}
                      </h2>
                      <p className="text-sm text-gray-500">
                        ID: {selectedEmployeeDetails.empID}
                      </p>
                    </div>
                    {!isEditingDetails && (
                      <button
                        onClick={handleEditDetails}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Edit
                      </button>
                    )}
                  </div>
                  {isEditingDetails ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditSave();
                      }}
                    >
                      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        <Section title="Personal Information">
                          <Input
                            label="Name"
                            name="name"
                            value={editDetails.name}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Surname"
                            name="surname"
                            value={editDetails.surname}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Company Email"
                            name="email"
                            type="email"
                            value={editDetails.email}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Personal Email"
                            name="personal_email"
                            type="email"
                            value={editDetails.personal_email}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Gender"
                            name="gender"
                            value={editDetails.gender}
                            onChange={handleEditChange}
                          />
                        </Section>
                        <Section title="Work Information">
                          <Input
                            label="Role"
                            name="role"
                            value={editDetails.role}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Department"
                            name="department"
                            value={editDetails.department}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Salary"
                            name="salary"
                            value={editDetails.salary}
                            onChange={handleEditChange}
                          />
                        </Section>
                        <Section title="Location">
                          <Input
                            label="State"
                            name="state"
                            value={editDetails.state}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="District"
                            name="district"
                            value={editDetails.district}
                            onChange={handleEditChange}
                          />
                        </Section>
                        <Section title="Credentials">
                          <p className="text-sm text-gray-500 mb-4 col-span-1 md:col-span-2">
                            Only fill these if you want to change them.
                          </p>
                          <Input
                            label="Username"
                            name="username"
                            value={editDetails.username}
                            onChange={handleEditChange}
                          />
                          <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={editDetails.password || ""}
                            onChange={handleEditChange}
                            placeholder="Enter new password"
                          />
                        </Section>
                      </div>
                      {editError && (
                        <div className="text-red-500 text-sm mt-4">
                          {editError}
                        </div>
                      )}
                      <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                          disabled={editLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          disabled={editLoading}
                        >
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                      <Section title="Personal Information">
                        <DetailItem
                          icon={<UserCircleIcon />}
                          label="Full Name"
                          value={`${selectedEmployeeDetails.name} ${selectedEmployeeDetails.surname}`}
                        />
                        <DetailItem
                          icon={<AtSymbolIcon />}
                          label="Company Email"
                          value={selectedEmployeeDetails.email}
                        />
                        <DetailItem
                          icon={<AtSymbolIcon />}
                          label="Personal Email"
                          value={
                            selectedEmployeeDetails.personal_email || "N/A"
                          }
                        />
                        <DetailItem
                          icon={<UserIcon />}
                          label="Gender"
                          value={selectedEmployeeDetails.gender}
                        />
                      </Section>
                      <Section title="Work Information">
                        <DetailItem
                          icon={<BriefcaseIcon />}
                          label="Role"
                          value={selectedEmployeeDetails.role}
                        />
                        <DetailItem
                          icon={<BriefcaseIcon />}
                          label="Department"
                          value={selectedEmployeeDetails.department}
                        />
                        <DetailItem
                          icon={<CurrencyDollarIcon />}
                          label="Salary"
                          value={selectedEmployeeDetails.salary}
                        />
                      </Section>
                      <Section title="Location">
                        <DetailItem
                          icon={<MapPinIcon />}
                          label="State"
                          value={selectedEmployeeDetails.state}
                        />
                        <DetailItem
                          icon={<MapPinIcon />}
                          label="District"
                          value={selectedEmployeeDetails.district}
                        />
                      </Section>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// Reusable components for the modal
const Section = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    {React.cloneElement(icon, {
      className: "w-6 h-6 mr-3 text-gray-400 flex-shrink-0",
    })}
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const StatCard = ({ icon, title, value, color, isLoading }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    teal: "bg-teal-100 text-teal-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
