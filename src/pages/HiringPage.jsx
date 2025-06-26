import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon, TrophyIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    candidate: '',
    jobRole: '',
    assignedTo: '',
    createdBy: '',
  });

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('currentHR'));
    if(user) {
        setCurrentUser(user);
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('https://the-aacharya.onrender.com/api/applications');
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error fetching applications: ' + error.message);
    }
  };

  const handleJobPost = async (data) => {
    setApplications(prev => [data, ...prev]);
    setIsJobPostingModalOpen(false);
  };

  const handleViewApplication = (application) => {
    console.log('Viewing application:', application);
  };

  const handleDeleteApplication = async (applicationToDelete) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${applicationToDelete.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete application');
        setApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (application, newStatus) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${application.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const handleAssignChange = async (application, employeeId) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${application.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assign_to: employeeId,
          previous_assignee: application.assign_to
        })
      });
      if (!response.ok) throw new Error('Failed to update assignment');
      const updatedApplication = await response.json();

      if (employeeId) {
        try {
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
          const messageResponse = await fetch('https://the-aacharya.onrender.com/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
          });
          if (!messageResponse.ok) {
            const errorData = await messageResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to create message (Status: ${messageResponse.status})`);
          }
        } catch (messageError) {
          console.error('Error creating message:', messageError);
        }
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === application.id ? updatedApplication : app
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
        case 'approve': newStatus = 'Approved'; break;
        case 'reject': newStatus = 'Rejected'; break;
        case 'remark': remark = prompt('Enter your remark:'); if (!remark) return; break;
        default: return;
      }

      if (newStatus) {
        const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${message.application_id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, remark })
        });
        if (!response.ok) throw new Error('Failed to update application status');
        setApplications(prev =>
          prev.map(app =>
            app.id === message.application_id ? { ...app, status: newStatus } : app
          )
        );
      }

      const messageResponse = await fetch(`https://the-aacharya.onrender.com/api/messages/${message.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', action, remark })
      });
      if (!messageResponse.ok) throw new Error('Failed to update message status');

      setIsMessageModalOpen(false);
      alert(action === 'remark' ? 'Remark added successfully' : `Application ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error handling message action:', error);
      alert('Error handling message action: ' + error.message);
    }
  };

  const handleSendTo = async (application, email, name) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${application.id}/send`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_to: email, employee_name: name })
      });
      if (!response.ok) throw new Error('Failed to update send to email');
      const updatedApplication = await response.json();
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id ? updatedApplication : app
        )
      );
    } catch (error) {
      console.error('Error updating send to email:', error);
      alert('Error updating send to email: ' + error.message);
    }
  };

  const handleMeetInfoUpdate = async (applicationId, meetInfo) => {
  try {
    let updatedMeetInfo = { ...meetInfo };

    if (!meetInfo.meet_link && meetInfo.meet_datetime && meetInfo.candidate_email) {
      const meetRes = await fetch('https://the-aacharya.onrender.com/api/create-interview-meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: meetInfo.meet_datetime,
          attendees: [meetInfo.candidate_email]
        })
      });

      const meetData = await meetRes.json();
      if (!meetRes.ok) throw new Error(meetData.error || 'Failed to generate Meet');

      updatedMeetInfo.meet_link = meetData.meetLink;
    }

    const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${applicationId}/meet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
        credentials: "include", // ✅ Needed for cookie/session

      body: JSON.stringify(updatedMeetInfo)
    });

    if (!response.ok) throw new Error('Failed to update meet info');
    alert("Meet info successfully added!");

    const updatedApplication = await response.json();
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, ...updatedApplication } : app
      )
    );

    return updatedApplication;
  } catch (error) {
    console.error('Error updating meet info:', error);
    alert('Error updating meet info: ' + error.message);
    throw error;
  }
};



  const handleApplicationDecision = async (application, decision) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/applications/${application.id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update decision: ${response.status}`);
      }
      
      const updatedApplication = await response.json();

      setApplications(prev =>
        prev.map(app => (app.id === application.id ? updatedApplication : app))
      );
    } catch (error) {
      console.error('Error making decision:', error);
      alert('Error making decision: ' + error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredApplications = applications.filter(app => {
    const candidateMatch = app.candidate_name.toLowerCase().includes(filters.candidate.toLowerCase());
    const jobRoleMatch = app.job_role.toLowerCase().includes(filters.jobRole.toLowerCase());
    
    const assigneeFullName = `${app.assignee_name || ''} ${app.assignee_surname || ''}`.toLowerCase();
    const assignedToMatch = !filters.assignedTo || assigneeFullName.includes(filters.assignedTo.toLowerCase());

    const creatorFullName = `${app.creator_name || ''} ${app.creator_surname || ''}`.toLowerCase();
    const createdByMatch = !filters.createdBy || creatorFullName.includes(filters.createdBy.toLowerCase());

    return candidateMatch && jobRoleMatch && assignedToMatch && createdByMatch;
  });

  const approvedCount = filteredApplications.filter(app => app.is_approved === 'yes').length;
  const rejectedCount = filteredApplications.filter(app => app.status === 'Rejected').length;
  const selectedCount = filteredApplications.filter(app => app.is_approved === 'selected').length;
  const inProgressCount = filteredApplications.length - approvedCount - rejectedCount - selectedCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Tracking</h1>
            <p className="text-gray-600 mt-1">Manage and track job applications.</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setIsJobPostingModalOpen(true)}
            >
              Add New Application
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="candidate" placeholder="By candidate..." value={filters.candidate} onChange={handleFilterChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="jobRole" placeholder="By job role..." value={filters.jobRole} onChange={handleFilterChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="assignedTo" placeholder="By assignee..." value={filters.assignedTo} onChange={handleFilterChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="createdBy" placeholder="By creator..." value={filters.createdBy} onChange={handleFilterChange} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ApplicationsTable
            applications={filteredApplications}
            currentUser={currentUser}
            onView={handleViewApplication}
            onDelete={handleDeleteApplication}
            onStatusChange={handleStatusChange}
            onAssignChange={handleAssignChange}
            onSendTo={handleSendTo}
            onMeetInfoUpdate={handleMeetInfoUpdate}
            onApplicationDecision={handleApplicationDecision}
          />
        </div>
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={selectedMessage}
        onApprove={(message) => handleMessageAction(message, 'approve')}
        onReject={(message) => handleMessageAction(message, 'reject')}
        onRemark={(message) => handleMessageAction(message, 'remark')}
      />

      <JobPostingModal
        isOpen={isJobPostingModalOpen}
        onClose={() => setIsJobPostingModalOpen(false)}
        onSubmit={handleJobPost}
      />

      <CandidateApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleJobPost}
        jobPosition={selectedJob?.position}
      />
    </motion.div>
  );
}