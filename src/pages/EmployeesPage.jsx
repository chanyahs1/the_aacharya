import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { EyeIcon, ArrowRightOnRectangleIcon, PencilIcon } from '@heroicons/react/24/outline';

// Separate component for role editing
const RoleEditor = ({ employee, onUpdate, onCancel }) => {
  const [newRole, setNewRole] = useState(employee.role);

  const handleSave = async () => {
    await onUpdate(employee.id, newRole);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        className="px-2 py-1 border rounded text-sm"
        placeholder="Enter new role"
        autoFocus
      />
      <button
        onClick={handleSave}
        className="text-success-600 hover:text-success-900"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="text-neutral-600 hover:text-neutral-900"
      >
        Cancel
      </button>
    </div>
  );
};

// Role display component
const RoleDisplay = ({ employee, onEdit }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
        {employee.department} {employee.role}
      </span>
      <button
        onClick={() => onEdit(employee.id)}
        className="text-primary-600 hover:text-primary-900"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  // Modal state for viewing details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  // Edit state for modal
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editDetails, setEditDetails] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      if (res.ok) {
        const data = await res.json();
        // Add isActive flag based on lastLogin/lastLogout timestamps
        const employeesWithStatus = data.map(emp => ({
          ...emp,
          isActive: emp.lastLogin && (!emp.lastLogout || new Date(emp.lastLogout) < new Date(emp.lastLogin))
        }));
        setEmployees(employeesWithStatus);
      } else {
        console.error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  const handleRoleUpdate = async (employeeId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        // Instead of just updating local state, re-fetch employees from backend
        await fetchEmployees();
        setEditingRoleId(null);
      } else {
        console.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const startEditing = (employeeId) => {
    setEditingRoleId(employeeId);
  };

  const cancelEditing = () => {
    setEditingRoleId(null);
  };

  const handleViewDetails = async (employeeId) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setShowDetailsModal(true);
    setIsEditingDetails(false);
    setEditDetails({});
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
      if (!res.ok) throw new Error('Failed to fetch employee details');
      const data = await res.json();
      setSelectedEmployeeDetails(data);
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
      const res = await fetch(`http://localhost:5000/api/employees/${selectedEmployeeDetails.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDetails),
      });
      if (!res.ok) throw new Error('Failed to update employee details');
      // Refresh details
      const data = await res.json();
      setSelectedEmployeeDetails({ ...selectedEmployeeDetails, ...editDetails });
      setIsEditingDetails(false);
      setEditDetails({});
      // Optionally, refresh the main employee list
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

  if (loading) {
    return <div className="text-center py-10">Loading employees...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">Employee List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Login Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Logout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Logout Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-neutral-500">
                    No employees found.
                  </td>
                </tr>
              )}
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {employee.empID}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {employee.name} {employee.surname}
                        </div>
                        <div className="text-sm text-neutral-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRoleId === employee.id ? (
                      <RoleEditor
                        employee={employee}
                        onUpdate={handleRoleUpdate}
                        onCancel={cancelEditing}
                      />
                    ) : (
                      <RoleDisplay
                        employee={employee}
                        onEdit={startEditing}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.lastLogin ? format(new Date(employee.lastLogin), 'dd MMM yyyy HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.loginLatitude && employee.loginLongitude ? (
                      <a 
                        href={`https://www.google.com/maps?q=${employee.loginLatitude},${employee.loginLongitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {employee.loginLatitude.toFixed(6)}, {employee.loginLongitude.toFixed(6)}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.lastLogout ? format(new Date(employee.lastLogout), 'dd MMM yyyy HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {employee.logoutLatitude && employee.logoutLongitude ? (
                      <a 
                        href={`https://www.google.com/maps?q=${employee.logoutLatitude},${employee.logoutLongitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {employee.logoutLatitude.toFixed(6)}, {employee.logoutLongitude.toFixed(6)}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => handleViewDetails(employee.id)}
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 text-2xl"
              onClick={() => setShowDetailsModal(false)}
            >
              ×
            </button>
            {detailsLoading ? (
              <div>Loading...</div>
            ) : detailsError ? (
              <div className="text-red-500">{detailsError}</div>
            ) : selectedEmployeeDetails ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Employee Details</h2>
                {isEditingDetails ? (
                  <>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={editDetails.name || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Surname:</label>
                      <input
                        type="text"
                        name="surname"
                        value={editDetails.surname || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={editDetails.email || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Role:</label>
                      <input
                        type="text"
                        name="role"
                        value={editDetails.role || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium">Department:</label>
                      <input
                        type="text"
                        name="department"
                        value={editDetails.department || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                     <div className="mb-2">
                      <label className="block text-sm font-medium">State:</label>
                      <input
                        type="text"
                        name="state"
                        value={editDetails.state || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                     <div className="mb-2">
                      <label className="block text-sm font-medium">District:</label>
                      <input
                        type="text"
                        name="district"
                        value={editDetails.district || ''}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1"
                      />
                    </div>
                    {editError && <div className="text-red-500 mb-2">{editError}</div>}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={handleEditSave}
                        className="px-4 py-2 bg-success-600 text-white rounded hover:bg-success-700"
                        disabled={editLoading}
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded hover:bg-neutral-300"
                        disabled={editLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div><strong>Name:</strong> {selectedEmployeeDetails.name} {selectedEmployeeDetails.surname}</div>
                    <div><strong>Employee ID:</strong> {selectedEmployeeDetails.empID}</div>
                    <div><strong>Email:</strong> {selectedEmployeeDetails.email}</div>
                    <div><strong>Role:</strong> {selectedEmployeeDetails.role}</div>
                    <div><strong>Department:</strong> {selectedEmployeeDetails.department}</div>
                    <div><strong>State:</strong> {selectedEmployeeDetails.state}</div>
                    <div><strong>District:</strong> {selectedEmployeeDetails.district}</div>
                    {/* Add more fields as needed */}
                    <button
                      onClick={handleEditDetails}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </motion.div>
  );
}
