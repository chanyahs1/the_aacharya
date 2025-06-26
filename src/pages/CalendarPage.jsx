import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, VideoCameraIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import EventModal from '../components/EventModal';
import EventOptionsModal from '../components/EventOptionsModal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee')) || JSON.parse(sessionStorage.getItem('currentEmployee'));
  const currentHR = JSON.parse(localStorage.getItem('currentHR')) || JSON.parse(sessionStorage.getItem('currentHR'));
  const createdBy = currentEmployee?.id || currentHR?.id;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/employees/calendar-events?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://the-aacharya.onrender.com/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleCreateEvent = async (formData) => {
    try {
      const response = await fetch('https://the-aacharya.onrender.com/api/employees/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy,
          attendees: formData.attendees.map(id => parseInt(id))
        })
      });
      if (!response.ok) throw new Error('Failed to create event');
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateEvent = async (formData) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/employees/calendar-events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attendees: formData.attendees.map(id => parseInt(id))
        })
      });
      if (!response.ok) throw new Error('Failed to update event');
      await fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`https://the-aacharya.onrender.com/api/employees/calendar-events/${eventId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      await fetchEvents();
      setIsOptionsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsOptionsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Calendar...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Company Calendar</h1>
            <p className="text-gray-600 mt-1">View and manage events, meetings, and holidays.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
            <button 
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-semibold text-gray-800 w-32 text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-4 px-2 text-center text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {blanks.map((_, i) => <div key={`blank-${i}`} className="border-r border-b border-gray-200 bg-gray-50" />)}

            {days.map(day => {
              const dayEvents = events.filter(event => new Date(event.start_time).getDate() === day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`relative p-3 min-h-[140px] cursor-pointer hover:bg-blue-50 transition-colors duration-200 border-r border-b border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{day}</span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-transform hover:scale-105 ${
                          event.event_type === 'meeting' 
                            ? 'bg-green-100 text-green-800' 
                            : event.event_type === 'holiday' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {event.event_type === 'meeting' && <VideoCameraIcon className="h-4 w-4 flex-shrink-0" />}
                        {event.event_type !== 'meeting' && event.event_type !== 'holiday' && <BriefcaseIcon className="h-4 w-4 flex-shrink-0" />}
                        <div className="flex-grow">
                          <div className="font-bold truncate">{event.title}</div>
                          <div className="text-xs opacity-90">
                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedDate(null); setSelectedEvent(null); }}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        selectedDate={selectedDate}
        employees={employees}
        event={selectedEvent}
      />

      <EventOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => { setIsOptionsModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        isCreator={selectedEvent?.created_by === createdBy}
        onUpdate={(event) => {
          setIsOptionsModalOpen(false);
          setSelectedDate(new Date(event.start_time));
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteEvent}
      />
    </motion.div>
  );
}
