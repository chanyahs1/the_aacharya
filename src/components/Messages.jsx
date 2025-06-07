import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import MessageModal from './MessageModal';

export default function Messages({ employeeId }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [employeeId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages?employee_id=${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setIsMessageModalOpen(true);
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

      // Refresh messages
      fetchMessages();
      setIsMessageModalOpen(false);
      alert(action === 'remark' ? 'Remark added successfully' : `Application ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error handling message action:', error);
      alert('Error handling message action: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 px-4 py-3 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-neutral-800">Messages</h2>
        <span className="flex h-5 w-5 items-center justify-center bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
          {messages.length}
        </span>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div 
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className="flex items-start space-x-2 p-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
            >
              <ChatBubbleLeftIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-neutral-800">
                    {message.content.candidate_name} - {message.content.job_role}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  Status: {message.content.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        message={selectedMessage?.content}
        onApprove={(message) => handleMessageAction(selectedMessage, 'approve')}
        onReject={(message) => handleMessageAction(selectedMessage, 'reject')}
        onRemark={(message) => handleMessageAction(selectedMessage, 'remark')}
      />
    </div>
  );
} 