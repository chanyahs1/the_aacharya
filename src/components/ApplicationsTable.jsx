import React, { useState, useEffect } from "react";
import {
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MeetInfoModal from "./MeetInfoModal";

const ITEMS_PER_PAGE = 6;

export default function ApplicationsTable({
  applications,
  currentUser,
  onView,
  onDelete,
  onStatusChange,
  onAssignChange,
  onSendTo,
  onMeetInfoUpdate,
  onApplicationDecision,
}) {
  const [employees, setEmployees] = useState([]);
  const [tempSendTo, setTempSendTo] = useState({});
  const [tempAssignTo, setTempAssignTo] = useState({});
  const [selectedMeetInfo, setSelectedMeetInfo] = useState(null);
  const [isMeetInfoModalOpen, setIsMeetInfoModalOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState({});
  const [reassignLoading, setReassignLoading] = useState({});
  const [pagination, setPagination] = useState({
    others: { currentPage: 1 },
    assigned: { currentPage: 1 },
    approved: { currentPage: 1 },
    selected: { currentPage: 1 },
    rejected: { currentPage: 1 },
  });
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
      } else if (app.is_approved === "assigned") {
        acc.assigned.push(app);
      } else if (app.is_approved === "selected") {
        acc.selected.push(app);
      } else if (app.status === "rejected") {
        acc.rejected.push(app);
      } else {
        acc.others.push(app);
      }
      return acc;
    },
    { approved: [], rejected: [], others: [], assigned: [], selected: [] }
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("https://the-aacharya.onrender.com/api/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handlePageChange = (tableType, pageUpdater) => {
    setPagination((prev) => ({
      ...prev,
      [tableType]: { currentPage: pageUpdater(prev[tableType].currentPage) },
    }));
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
      candidate_email: application.candidate_email, // <-- add this
    });
    setIsMeetInfoModalOpen(true);
  };

  const handleMeetInfoSave = async (applicationId, meetInfo) => {
    try {
      await onMeetInfoUpdate(applicationId, {
        ...meetInfo,
        candidate_email: selectedMeetInfo?.candidate_email, // include this!
      });
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
    return tempAssignTo[application.id] || application.assign_to || "";
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

  const renderApplicationsTable = (apps, title, subtitle, tableType) => {
    const currentPage = pagination[tableType].currentPage;
    const paginatedApps = apps.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    return (
      <div className="mb-8 last:mb-0">
        <div className="px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Job Role
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">
                  Created By
                </th>
                {title.includes("New") && (
                  <>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Meet Info
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Assign To
                    </th>
                  </>
                )}
                {title.includes("Assigned") && (
                  <>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      History
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Assigned To
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Remarks
                    </th>
                  </>
                )}
                {title.includes("Approved") && (
                  <>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      History
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Meet Info
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold w-72">
                      Reassign To
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Remarks
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Actions
                    </th>
                  </>
                )}
                {title.includes("Selected") && (
                  <>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      History
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Remarks
                    </th>
                  </>
                )}
                {title.includes("Rejected") && (
                  <>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      History
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Remarks
                    </th>
                  </>
                )}
                <th scope="col" className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apps.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No applications in this category.
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {app.candidate_name}
                    </td>
                    <td className="px-6 py-4">{app.job_role}</td>
                    <td className="px-6 py-4">{app.created_by}</td>
                    {title.includes("New") && (
                      <>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleMeetInfoClick(app)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <CalendarDaysIcon className="h-5 w-5" />
                            <span>{app.meet_link ? "View" : "Add"} Info</span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={getCurrentAssignValue(app)}
                              onChange={(e) =>
                                handleTempAssignChange(app.id, e.target.value)
                              }
                              className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Assignee</option>
                              {employees.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.name} {e.surname}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignConfirm(app)}
                              className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              <UserPlusIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {title.includes("Assigned") && (
                      <>
                        <td className="px-6 py-4 text-gray-600">
                          {app.history || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {app.assignee_name} {app.assignee_surname}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.remarks || "-"}
                        </td>
                      </>
                    )}
                    {title.includes("Approved") && (
                      <>
                        <td className="px-6 py-4 text-gray-600">
                          {app.history || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleMeetInfoClick(app)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <CalendarDaysIcon className="h-5 w-5" />
                            <span>{app.meet_link ? "View" : "Add"} Info</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 w-72">
                          <div className="flex items-center gap-2">
                            <select
                              value={reassignTo[app.id] || "default"}
                              onChange={(e) =>
                                handleReassignChange(app.id, e.target.value)
                              }
                              className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              disabled={reassignLoading[app.id]}
                            >
                              <option value="default" disabled>
                                Select Assignee
                              </option>
                              {employees
                                .filter((emp) => emp.id !== app.assign_to)
                                .map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name} {emp.surname}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleReassign(app.id)}
                              disabled={
                                !reassignTo[app.id] || reassignLoading[app.id]
                              }
                              className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {reassignLoading[app.id] ? (
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                              ) : (
                                <UserPlusIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.remarks || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-stretch gap-2">
                            <button
                              onClick={() =>
                                onApplicationDecision(app, "select")
                              }
                              className="flex items-center justify-center gap-1 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Select
                            </button>
                            <button
                              onClick={() =>
                                onApplicationDecision(app, "reject")
                              }
                              className="flex items-center justify-center gap-1 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {title.includes("Selected") && (
                      <>
                        <td className="px-6 py-4 text-gray-600">
                          {app.history || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.remarks || "-"}
                        </td>
                      </>
                    )}
                    {title.includes("Rejected") && (
                      <>
                        <td className="px-6 py-4 text-gray-600">
                          {app.history || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {app.remarks || "-"}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-4"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalItems={apps.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(updater) => handlePageChange(tableType, updater)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Applications */}
      {renderApplicationsTable(
        groupedApplications.others,
        "New Applications",
        "Candidates awaiting review and assignment.",
        "others"
      )}

      {renderApplicationsTable(
        groupedApplications.assigned,
        "Assigned Applications",
        "Candidates who have been assigned to a reviewer.",
        "assigned"
      )}

      {/* Approved Applications */}
      {renderApplicationsTable(
        groupedApplications.approved,
        "Approved Applications",
        "Candidates who have been approved for next steps.",
        "approved"
      )}

      {/* Selected Applications */}
      {renderApplicationsTable(
        groupedApplications.selected,
        "Selected Applications",
        "Candidates who have been selected for hiring.",
        "selected"
      )}

      {/* Rejected Applications */}
      {renderApplicationsTable(
        groupedApplications.rejected,
        "Rejected Applications",
        "Candidates who were not selected.",
        "rejected"
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
