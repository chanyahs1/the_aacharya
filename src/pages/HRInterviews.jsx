import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function Interviews({ employeeId }) {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reassignLoading, setReassignLoading] = useState({});

  useEffect(() => {
    fetchInterviews();
  }, [employeeId]);

const fetchInterviews = async () => {
  try {
    const response = await fetch(`https://the-aacharya.onrender.com/api/applications`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch interviews: ${response.status} ${errorText}`
      );
    }
    const data = await response.json();

    const assignedApplications = data.filter((app) => {
      const appAssignTo = app.assign_to ? String(app.assign_to) : null;
      const isApproved = app.is_approved
        ? String(app.is_approved).toLowerCase()
        : "no";

      return (
        appAssignTo === String(employeeId) &&
        (isApproved === "no" || isApproved === "assigned")
      );
    });

    setInterviews(assignedApplications);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleStatusUpdate = async (application, newStatus) => {
    try {
      let remark = '';
      if (newStatus === 'Approved' || newStatus === 'Rejected') {
        remark = prompt(`Please enter a remark for ${newStatus.toLowerCase()}ing the application:`);
        if (remark === null) {
          // User cancelled the prompt
          return;
        }
      }

      const isApproving = newStatus === "Approved";
      const isRejecting = newStatus === "Rejected";

      const currentUser = JSON.parse(
        localStorage.getItem("currentHR") ||
          sessionStorage.getItem("currentHR")
      );
      if (!currentUser) throw new Error("User details not found");

      const currentRound = application.current_round || 1;

      const requestBody = {
        status: newStatus,
        is_approved: isApproving ? "yes" : isRejecting ? "rejected" : "pending",
        current_round: currentRound,
        round_approver: `${currentUser.name} ${currentUser.surname}`,
        remarks: remark,
      };

      const response = await fetch(
        `https://the-aacharya.onrender.com/api/applications/${application.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update application status"
        );
      }

      // Remove from UI after any action
      setInterviews((prev) => prev.filter((app) => app.id !== application.id));

      alert(
        isApproving
          ? "Application approved successfully!"
          : isRejecting
          ? "Application rejected successfully!"
          : "Remark submitted successfully!"
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Error updating application status: " + error.message);
    }
  };

  const handleReassign = async (application, newAssigneeId) => {
    try {
      if (!newAssigneeId || newAssigneeId === "default") {
        throw new Error("Please select an assignee");
      }
      setReassignLoading((prev) => ({ ...prev, [application.id]: true }));
      const currentUser = JSON.parse(
        localStorage.getItem("currentEmployee") ||
          sessionStorage.getItem("currentEmployee")
      );
      if (!currentUser) throw new Error("User details not found");

      const currentRound = application.current_round || 1;
      const nextRound = application.round1_approved_by
        ? currentRound + 1
        : currentRound;

      const response = await fetch(
        `https://the-aacharya.onrender.com/api/applications/${application.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assign_to: newAssigneeId,
            current_round: nextRound,
            round_approver: `${currentUser.name} ${currentUser.surname}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reassign application");
      }

      setInterviews((prev) => prev.filter((app) => app.id !== application.id));
      alert(`Application reassigned successfully!`);
    } catch (error) {
      console.error("Error reassigning application:", error);
      alert("Error reassigning application: " + error.message);
    } finally {
      setReassignLoading((prev) => ({ ...prev, [application.id]: false }));
    }
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading)
    return <div className="text-center py-4">Loading interviews...</div>;
  if (error)
    return <div className="text-red-600 text-center py-4">{error}</div>;

  const currentEmployee = JSON.parse(localStorage.getItem("currentHR") || sessionStorage.getItem("currentHR"));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-orange-100 p-3 rounded-full">
            <Briefcase className="w-9 h-9 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Interviews</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Interviews Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Interviews
          </h2>
          <div className="space-y-4">
            {interviews.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">
                No interviews assigned
              </p>
            ) : (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {interview.candidate_name}
                      </h3>
                      <p className="text-sm text-neutral-500">{interview.email}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Role: {interview.job_role}
                      </p>

                      {interview.resume_path && (
                        <a
                          href={`https://the-aacharya.onrender.com/${interview.resume_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                          download
                        >
                          Download Resume
                        </a>
                      )}
                    </div>
                  </div>

                  {interview.meet_datetime && (
                    <div className="mt-2 text-sm text-neutral-600">
                      <p>Meeting: {formatDateTime(interview.meet_datetime)}</p>
                      {interview.meet_link && (
                        <a
                          href={interview.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(interview, "Approved")}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(interview, "Rejected")}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Interview Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900">
                    Candidate Information
                  </h4>
                  <p className="text-neutral-600">
                    Name: {selectedInterview.candidate_name}
                  </p>
                  <p className="text-neutral-600">
                    Email: {selectedInterview.email}
                  </p>
                  <p className="text-neutral-600">
                    Role: {selectedInterview.job_role}
                  </p>
                </div>

                {selectedInterview.resume_path && (
                  <div>
                    <h4 className="font-medium text-neutral-900">Resume</h4>
                    <a
                      href={`https://the-aacharya.onrender.com/${selectedInterview.resume_path.replace(
                        /^\/+/,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      Download Resume
                    </a>
                  </div>
                )}

                {selectedInterview.meet_datetime && (
                  <div>
                    <h4 className="font-medium text-neutral-900">
                      Meeting Information
                    </h4>
                    <p className="text-neutral-600">
                      Scheduled: {formatDateTime(selectedInterview.meet_datetime)}
                    </p>
                    {selectedInterview.meet_link && (
                      <a
                        href={selectedInterview.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Join Meeting
                      </a>
                    )}
                    {selectedInterview.meet_remarks && (
                      <p className="text-neutral-600 mt-2">
                        Remarks: {selectedInterview.meet_remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
