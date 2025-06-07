import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, BellIcon } from '@heroicons/react/24/outline';

export default function EmployeeCalendar({ employeeId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  useEffect(() => {
    fetchEvents();
    // Remove periodic fetch
  }, [currentDate, employeeId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/calendar-events?month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      // Filter events where this employee is an attendee
      const relevantEvents = data.filter(event => 
        event.attendees.some(attendee => attendee.id === employeeId)
      );
      
      setEvents(relevantEvents);

      // Check for upcoming events (within next hour) for notifications
      const now = new Date();
      const upcomingEvents = relevantEvents.filter(event => {
        const eventTime = new Date(event.start_time);
        const timeDiff = eventTime - now;
        // Show notification for events starting within the next hour
        return timeDiff > 0 && timeDiff <= 3600000;
      });

      setNotifications(upcomingEvents);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const formatEventTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center text-neutral-600">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="text-center text-error-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BellIcon className="w-5 h-5 text-warning-500" />
            <h3 className="font-medium text-warning-800">Upcoming Events</h3>
          </div>
          <div className="space-y-2">
            {notifications.map(event => (
              <div key={event.id} className="text-sm text-warning-800">
                <span className="font-medium">{event.title}</span>
                <span className="text-warning-600"> starts at {formatEventTime(event.start_time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-neutral-800">Calendar</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-neutral-100 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5 text-neutral-600" />
            </button>
            <span className="text-lg font-medium text-neutral-800">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-neutral-100 rounded-full"
            >
              <ChevronRightIcon className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-neutral-50 p-2 text-center text-sm font-medium text-neutral-600">
              {day}
            </div>
          ))}
          
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="bg-white p-2 min-h-[100px]"></div>
          ))}
          
          {days.map((day) => {
            const dayEvents = events.filter(event => {
              const eventDate = new Date(event.start_time);
              return eventDate.getDate() === day;
            });
            
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div
                key={day}
                className={`bg-white p-2 min-h-[100px] ${
                  isToday ? 'ring-2 ring-primary-500 ring-inset' : ''
                }`}
              >
                <span className={`inline-block w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${isToday ? 'bg-primary-500 text-white' : 'text-neutral-900'}`}>
                  {day}
                </span>
                
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`mt-1 p-1.5 rounded-md text-xs
                      ${event.event_type === 'payroll' ? 'bg-primary-50 text-primary-700' :
                        event.event_type === 'meeting' ? 'bg-success-50 text-success-700' :
                          'bg-warning-50 text-warning-700'
                      }`}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {formatEventTime(event.start_time)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 