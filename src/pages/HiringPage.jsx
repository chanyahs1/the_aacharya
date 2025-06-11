import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import JobPostingModal from '../components/JobPostingModal';
import CandidateApplicationModal from '../components/CandidateApplicationModal';
import ApplicationsTable from '../components/ApplicationsTable';
import MessageModal from '../components/MessageModal';

export default function HiringPage() {
  const [isJobPostingModalOpen, setIsJobPostingModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch applications: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched applications:', data);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error fetching applications: ' + error.message);
    }
  };

  const handleJobPost = async (data) => {
    try {
      // The data is already submitted to the backend in the modal
      // Just update the local state with the new application
      setApplications(prev => [data, ...prev]);
      setIsJobPostingModalOpen(false);
    } catch (error) {
      console.error('Error handling job post:', error);
      alert('Error handling job post: ' + error.message);
    }
  };

  const handleViewApplication = (application) => {
    // You can implement a detailed view modal here
    console.log('Viewing application:', application);
  };

  const handleDeleteApplication = async (applicationToDelete) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/applications/${applicationToDelete.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete application');
        }

        setApplications(prev => 
          prev.filter(app => app.id !== applicationToDelete.id)
        );
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (application, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${application.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const handleAssignChange = async (application, employeeId) => {
    try {
      // First update the assignment
      const response = await fetch(`http://localhost:5000/api/applications/${application.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          assign_to: employeeId,
          previous_assignee: application.assign_to
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      // Get the updated application data
      const updatedApplication = await response.json();

      // Only create a message if there's a valid employee ID
      if (employeeId) {
        try {
          // Log the message data for debugging
          const messageData = {
            employee_id: employeeId,
            application_id: application.id,
            type: 'application_assignment',
            content: {
              candidate_name: application.candidate_name,
              candidate_email: application.candidate_email,
              job_role: application.job_role,
              status: application.status,
              resume_url: application.resume_url,
              meet_remarks: application.meet_remarks,
              meet_link: application.meet_link,
              meet_datetime: application.meet_datetime,
              previous_assignee: application.assign_to
            }
          };
          console.log('Attempting to create message with data:', messageData);

          // Create a message for the new employee
          const messageResponse = await fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData)
          });

          if (!messageResponse.ok) {
            const errorData = await messageResponse.json().catch(() => ({}));
            console.error('Message creation failed with status:', messageResponse.status);
            console.error('Error response:', errorData);
            throw new Error(errorData.message || `Failed to create message (Status: ${messageResponse.status})`);
          }

          const messageResult = await messageResponse.json();
          console.log('Message created successfully:', messageResult);
        } catch (messageError) {
          console.error('Error creating message:', messageError);
          // Continue with the assignment update even if message creation fails
        }
      }

      // Update the applications list with the complete updated application data
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? updatedApplication
            : app
        )
      );
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment: ' + error.message);
    }
  };

  const handleMessageAction = async (message, action) => {
    try {
      let newStatus;
      let remark = '';

      switch (action) {
        case 'approve':
          newStatus = 'Approved';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        case 'remark':
          remark = prompt('Enter your remark:');
          if (!remark) return;
          break;
        default:
          return;
      }

      // Update application status
      if (newStatus) {
        const response = await fetch(`http://localhost:5000/api/applications/${message.application_id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: newStatus,
            remark: remark
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update application status');
        }

        // Update the applications list
        setApplications(prev =>
          prev.map(app =>
            app.id === message.application_id
              ? { ...app, status: newStatus }
              : app
          )
        );
      }

      // Update message status
      const messageResponse = await fetch(`http://localhost:5000/api/messages/${message.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'completed',
          action: action,
          remark: remark
        })
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to update message status');
      }

      setIsMessageModalOpen(false);
      alert(action === 'remark' ? 'Remark added successfully' : `Application ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error handling message action:', error);
      alert('Error handling message action: ' + error.message);
    }
  };

  const handleSendTo = async (application, email, name) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${application.id}/send`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          send_to: email,
          employee_name: name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update send to email');
      }

      const updatedApplication = await response.json();
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? updatedApplication
            : app
        )
      );
    } catch (error) {
      console.error('Error updating send to email:', error);
      alert('Error updating send to email: ' + error.message);
    }
  };

  const handleMeetInfoUpdate = async (applicationId, meetInfo) => {
    try {
      // First update the meet info
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/meet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to update meet information');
      }

      // Get the updated application data from the response
      const updatedApplication = await response.json();

      // Update the applications list with the new data
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, ...updatedApplication }
            : app
        )
      );

      return updatedApplication;
    } catch (error) {
      console.error('Error updating meet information:', error);
      alert('Error updating meet information: ' + error.message);
      throw error; // Re-throw the error to be handled by the component
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Hiring</h1>
          <p className="text-neutral-600 mt-1">Submit your application</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" icon={<FunnelIcon className="w-5 h-5" />}>
            Filter
          </Button>
          <Button 
            variant="primary" 
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setIsJobPostingModalOpen(true)}
          >
            Submit Application
          </Button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="mt-6">
        
        <ApplicationsTable
          applications={applications}
          onView={handleViewApplication}
          onDelete={handleDeleteApplication}
          onStatusChange={handleStatusChange}
          onAssignChange={handleAssignChange}
          onSendTo={handleSendTo}
          onMeetInfoUpdate={handleMeetInfoUpdate}
        />
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={selectedMessage}
        onApprove={(message) => handleMessageAction(message, 'approve')}
        onReject={(message) => handleMessageAction(message, 'reject')}
        onRemark={(message) => handleMessageAction(message, 'remark')}
      />

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={isJobPostingModalOpen}
        onClose={() => setIsJobPostingModalOpen(false)}
        onSubmit={handleJobPost}
      />

      {/* Candidate Application Modal */}
      <CandidateApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleJobPost}
        jobPosition={selectedJob?.position}
      />
    </motion.div>
  );
}