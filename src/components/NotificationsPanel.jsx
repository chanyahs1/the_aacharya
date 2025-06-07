import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NotificationsPanel({ employeeId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Remove auto-refresh interval
  }, [employeeId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/notifications/${notificationId}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      // Update the local state to mark the notification as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-neutral-600">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-error-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Notifications</h2>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-neutral-500 text-center py-4">No notifications</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.is_read ? 'bg-white border-neutral-200' : 'bg-primary-50 border-primary-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {notification.title}
                  </h3>
                  <p className="text-neutral-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex items-center px-3 py-1 text-sm text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 