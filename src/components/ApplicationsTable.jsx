import React, { useState, useEffect } from "react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import MeetInfoModal from "./MeetInfoModal";

export default function ApplicationsTable({
  applications,
  onView,
  onDelete,
  onStatusChange,
  onAssignChange,
  onSendTo,
  onMeetInfoUpdate,
}) {
  const [employees, setEmployees] = useState([]);
  const [tempSendTo, setTempSendTo] = useState({});
  const [tempAssignTo, setTempAssignTo] = useState({});
  const [selectedMeetInfo, setSelectedMeetInfo] = useState(null);
  const [isMeetInfoModalOpen, setIsMeetInfoModalOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState({});
  const [reassignLoading, setReassignLoading] = useState({});
  const statusOptions = [
    "Pending",
    "In Review",
    "Shortlisted",
    "Rejected",
    "Hired",
  ];

  // Group applications by status and approval
  const groupedApplications = applications.reduce(
    (acc, app) => {
      if (app.is_approved === "yes") {
        acc.approved.push(app);
      } else if (app.status === "Rejected") {
        acc.rejected.push(app);
      } else {
        acc.others.push(app);
      }
      return acc;
    },
    { approved: [], rejected: [], others: [] }
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleTempSendToChange = (applicationId, employee) => {
    setTempSendTo((prev) => ({
      ...prev,
      [applicationId]: employee,
    }));
  };

  const handleSendToConfirm = (application) => {
    const selectedEmployee = tempSendTo[application.id];
    if (selectedEmployee) {
      onSendTo(application, selectedEmployee.email, selectedEmployee.name);
      setTempSendTo((prev) => {
        const newState = { ...prev };
        delete newState[application.id];
        return newState;
      });
    }
  };

  const handleTempAssignChange = (applicationId, employeeId) => {
    setTempAssignTo((prev) => ({
      ...prev,
      [applicationId]: employeeId,
    }));
  };

  const handleAssignConfirm = (application) => {
    const selectedEmployeeId = tempAssignTo[application.id];
    if (selectedEmployeeId) {
      onAssignChange(application, selectedEmployeeId);
      setTempAssignTo((prev) => {
        const newState = { ...prev };
        delete newState[application.id];
        return newState;
      });
    }
  };

  const handleMeetInfoClick = (application) => {
    setSelectedMeetInfo({
      id: application.id,
      meet_remarks: application.meet_remarks,
      meet_link: application.meet_link,
      meet_datetime: application.meet_datetime,
    });
    setIsMeetInfoModalOpen(true);
  };

  const handleMeetInfoSave = async (applicationId, meetInfo) => {
    try {
      await onMeetInfoUpdate(applicationId, meetInfo);
      setIsMeetInfoModalOpen(false);
    } catch (error) {
      console.error("Error updating meet information:", error);
      alert("Error updating meet information: " + error.message);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentSendToValue = (application) => {
    if (tempSendTo[application.id]) {
      return tempSendTo[application.id].email;
    }
    if (application.send_to) {
      try {
        const sendToData = JSON.parse(application.send_to);
        return sendToData.email;
      } catch (e) {
        return application.send_to;
      }
    }
    return "";
  };

  const getCurrentAssignValue = (application) => {
    if (tempAssignTo[application.id]) {
      return tempAssignTo[application.id];
    }
    return application.assign_to || "";
  };

  const handleReassignChange = (applicationId, employeeId) => {
    setReassignTo((prev) => ({
      ...prev,
      [applicationId]: employeeId,
    }));
  };

  const handleReassign = async (applicationId) => {
    try {
      setReassignLoading((prev) => ({
        ...prev,
        [applicationId]: true,
      }));
      await onAssignChange(
        applications.find((app) => app.id === applicationId),
        reassignTo[applicationId]
      );
      setReassignTo((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
      setReassignLoading((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    } catch (error) {
      console.error("Error reassigning application:", error);
      alert("Error reassigning application: " + error.message);
    } finally {
      setReassignLoading((prev) => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    }
  };

  const renderApplicationsTable = (applications, title) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-neutral-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Candidate Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Job Role
              </th>
              {title === "Approved Applications" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Meet Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reassign To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"></th>
                </>
              ) : title === "Rejected Applications" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Trigger Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"></th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Meet Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assign To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Send To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"></th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan={title === "Approved Applications" ? 4 : 8}
                  className="px-6 py-4 text-center text-neutral-500"
                >
                  No applications found
                </td>
              </tr>
            ) : (
              applications.map((application, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">
                      {application.candidate_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-600">
                      {application.job_role}
                    </div>
                  </td>
                  {title === "Approved Applications" && (
                    <>
                      <td className="font-medium text-sm text-neutral-600">
                        {application.history}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleMeetInfoClick(application)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {application.meet_remarks ||
                          application.meet_link ||
                          application.meet_datetime
                            ? "View Meet Info"
                            : "Add Meet Info"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={reassignTo[application.id] || "default"}
                            onChange={(e) =>
                              handleReassignChange(
                                application.id,
                                e.target.value
                              )
                            }
                            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={reassignLoading[application.id]}
                          >
                            <option value="default" disabled>
                              Select Assignee
                            </option>
                            {employees
                              .filter(
                                (emp) =>
                                  emp.id !== application.assign_to &&
                                  !(
                                    emp.name === application.approved_by_name &&
                                    emp.surname ===
                                      application.approved_by_surname
                                  )
                              )
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} {emp.surname} ({emp.role})
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleReassign(application.id)}
                            disabled={
                              !reassignTo[application.id] ||
                              reassignLoading[application.id]
                            }
                            className={`px-3 py-2 text-sm font-medium text-white rounded-md ${
                              !reassignTo[application.id] ||
                              reassignLoading[application.id]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {reassignLoading[application.id]
                              ? "Reassigning..."
                              : "Reassign"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => onDelete(application)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {title === "Rejected Applications" && (
                    <>
                      <td className="font-medium text-sm text-neutral-600">
                        {application.history}
                      </td>
                      <td>
                        <button className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                          Send Email
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => onDelete(application)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {title !== "Approved Applications" &&
                    title !== "Rejected Applications" && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleMeetInfoClick(application)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {application.meet_remarks ||
                            application.meet_link ||
                            application.meet_datetime
                              ? "View Meet Info"
                              : "Add Meet Info"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={getCurrentAssignValue(application)}
                              onChange={(e) =>
                                handleTempAssignChange(
                                  application.id,
                                  e.target.value
                                )
                              }
                              className="text-sm border border-neutral-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select Assignee</option>
                              {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.name} {employee.surname} -{" "}
                                  {employee.role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignConfirm(application)}
                              className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              OK
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={getCurrentSendToValue(application)}
                              onChange={(e) => {
                                const selectedEmployee = employees.find(
                                  (emp) => emp.email === e.target.value
                                );
                                if (selectedEmployee) {
                                  handleTempSendToChange(application.id, {
                                    email: selectedEmployee.email,
                                    name: `${selectedEmployee.name} ${selectedEmployee.surname}`,
                                  });
                                }
                              }}
                              className="text-sm border border-neutral-300 rounded-md px-2 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select Recipient</option>
                              {employees.map((employee) => (
                                <option
                                  key={employee.id}
                                  value={employee.email}
                                >
                                  {employee.name} {employee.surname} -{" "}
                                  {employee.email}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSendToConfirm(application)}
                              className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              OK
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => onDelete(application)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Applications */}
      {renderApplicationsTable(groupedApplications.others, "Applications")}

      {/* Approved Applications */}
      {renderApplicationsTable(
        groupedApplications.approved,
        "Approved Applications"
      )}

      {/* Rejected Applications */}
      {renderApplicationsTable(
        groupedApplications.rejected,
        "Rejected Applications"
      )}

      <MeetInfoModal
        isOpen={isMeetInfoModalOpen}
        onClose={() => setIsMeetInfoModalOpen(false)}
        meetInfo={selectedMeetInfo}
        onSave={handleMeetInfoSave}
        applicationId={selectedMeetInfo?.id}
      />
    </div>
  );
}
