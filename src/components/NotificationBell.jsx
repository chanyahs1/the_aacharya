import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationBell({ employeeId }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Remove auto-refresh interval
  }, [employeeId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/notifications/${notificationId}`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-error-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-neutral-500 text-center">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer
                    ${!notification.is_read ? 'bg-primary-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <h4 className="text-sm font-medium text-neutral-900">{notification.title}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-neutral-400 mt-1">{formatTime(notification.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 