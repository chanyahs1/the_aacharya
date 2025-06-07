import React, { useState, useEffect } from 'react';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

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
      console.log('Fetching interviews for employee:', employeeId, 'type:', typeof employeeId);
      // Using the existing applications endpoint with a filter
      const response = await fetch(`http://localhost:5000/api/applications`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch interviews: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('All applications:', data);
      
      // Filter applications to only show those assigned to this employee
      const assignedApplications = data.filter(app => {
        // Convert both to strings for comparison to handle both number and string types
        const appAssignTo = app.assign_to ? String(app.assign_to) : null;
        const empId = String(employeeId);
        
        console.log('Comparing application:', {
          applicationId: app.id,
          candidateName: app.candidate_name,
          appAssignTo,
          empId,
          matches: appAssignTo === empId,
          assignToType: typeof app.assign_to,
          empIdType: typeof employeeId
        });
        
        return appAssignTo === empId;
      });
      
      console.log('Filtered assigned applications:', assignedApplications);
      setInterviews(assignedApplications);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (application, newStatus) => {
    try {
      const isApproving = newStatus === 'Approved';
      const isRejecting = newStatus === 'Rejected';
      
      if (isApproving || isRejecting) {
        const action = isApproving ? 'approve' : 'reject';
        const confirmed = window.confirm(`Are you sure you want to ${action} this application?`);
        if (!confirmed) {
          return;
        }
      }

      // Get the current user's details from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
      
      if (!currentUser) {
        throw new Error('User details not found');
      }

      const currentRound = application.current_round || 1;

      const requestBody = {
        status: newStatus,
        is_approved: isApproving ? 'yes' : 'no',
        current_round: currentRound,
        round_approver: `${currentUser.name} ${currentUser.surname}`
      };

      const response = await fetch(`http://localhost:5000/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application status');
      }

      // Remove the application from the list after successful update
      setInterviews(prevInterviews => 
        prevInterviews.filter(app => app.id !== application.id)
      );

      // Show success message
      alert(`Application ${isApproving ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status: ' + error.message);
    }
  };

  const handleReassign = async (application, newAssigneeId) => {
    try {
      if (!newAssigneeId || newAssigneeId === 'default') {
        throw new Error('Please select an assignee');
      }

      setReassignLoading(prev => ({ ...prev, [application.id]: true }));

      // Get the current user's details from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
      
      if (!currentUser) {
        throw new Error('User details not found');
      }

      // If round 1 is approved, increment round for reassignment
      const currentRound = application.current_round || 1;
      const nextRound = application.round1_approved_by ? currentRound + 1 : currentRound;

      const response = await fetch(`http://localhost:5000/api/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assign_to: newAssigneeId,
          current_round: nextRound,
          round_approver: `${currentUser.name} ${currentUser.surname}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reassign application');
      }

      // Remove the application from the list after successful reassignment
      setInterviews(prevInterviews => 
        prevInterviews.filter(app => app.id !== application.id)
      );

      // Show success message
      alert(`Application reassigned successfully!`);
    } catch (error) {
      console.error('Error reassigning application:', error);
      alert('Error reassigning application: ' + error.message);
    } finally {
      setReassignLoading(prev => ({ ...prev, [application.id]: false }));
    }
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading interviews...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Interviews</h2>
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <p className="text-neutral-500 text-center py-4">No interviews assigned</p>
        ) : (
          interviews.map((interview) => (
            <div 
              key={interview.id}
              className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-neutral-900">{interview.candidate_name}</h3>
                  <p className="text-sm text-neutral-500">{interview.candidate_email}</p>
                  <p className="text-sm text-neutral-600 mt-1">Role: {interview.job_role}</p>
                  {interview.resume_url && (
                    <a 
                      href={interview.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                    >
                      View Resume
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
                  onClick={() => handleStatusUpdate(interview, 'Approved')}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-success-600 rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(interview, 'Rejected')}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-error-600 rounded-md hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    const remark = prompt('Enter your remark:');
                    if (remark) {
                      handleStatusUpdate(interview, 'In Review', remark);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Remarks
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interview Details Modal */}
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
                <h4 className="font-medium text-neutral-900">Candidate Information</h4>
                <p className="text-neutral-600">Name: {selectedInterview.candidate_name}</p>
                <p className="text-neutral-600">Email: {selectedInterview.candidate_email}</p>
                <p className="text-neutral-600">Role: {selectedInterview.job_role}</p>
              </div>

              {selectedInterview.resume_url && (
                <div>
                  <h4 className="font-medium text-neutral-900">Resume</h4>
                  <a 
                    href={selectedInterview.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View Resume
                  </a>
                </div>
              )}

              {selectedInterview.meet_datetime && (
                <div>
                  <h4 className="font-medium text-neutral-900">Meeting Information</h4>
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
  );
} 