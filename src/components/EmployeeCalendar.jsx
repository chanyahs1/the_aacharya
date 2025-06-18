import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import EventModal from './EventModal';
import EventOptionsModal from './EventOptionsModal';

export default function EmployeeCalendar({ employeeId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
  }, [currentDate]);

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee')) || JSON.parse(sessionStorage.getItem('currentEmployee'));
const currentHR = JSON.parse(localStorage.getItem('currentHR')) || JSON.parse(sessionStorage.getItem('currentHR'));
// const createdBy = currentEmployee?.id || currentHR?.id;


const fetchEvents = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/employees/calendar-events?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
    const data = await res.json();

    // Normalize attendees to IDs if necessary
    const filtered = data.filter(event => {
      const attendeeIds = event.attendees?.map(a => typeof a === 'object' ? a.id : a) || [];
      return event.created_by === employeeId || attendeeIds.includes(employeeId);
    });

    setEvents(filtered);
    setError(null);
  } catch (err) {
    setError('Failed to load events');
  } finally {
    setLoading(false);
  }
};


const fetchEmployees = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/employees');
    if (!response.ok) throw new Error('Failed to fetch employees');
    let data = await response.json();

    // Only show employees from same department if it's an employee
    if (currentEmployee) {
      data = data.filter(emp => emp.department === currentEmployee.department);
    }

    setEmployees(data);
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
};


  const handleCreateEvent = async (formData) => {
    try {
      const res = await fetch('http://localhost:5000/api/employees/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: employeeId,
          attendees: formData.attendees.map(id => parseInt(id))
        })
      });
      if (!res.ok) throw new Error('Failed to create event');
      await fetchEvents();
      setIsModalOpen(false);
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
    return <div className="text-center p-6 text-neutral-600">Loading calendar...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Calendar</h1>
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
              <ChevronLeftIcon className="w-5 h-5 text-neutral-600" />
            </button>
            <span className="text-lg font-medium">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
            <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
              <ChevronRightIcon className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <div className="grid grid-cols-7 gap-px bg-neutral-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="bg-neutral-50 p-4 text-center text-sm font-medium text-neutral-600">{day}</div>
          ))}

          {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white p-4 min-h-[100px]" />)}

          {days.map(day => {
            const dayEvents = events.filter(event => new Date(event.start_time).getDate() === day);
            const isToday = day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`bg-white p-4 min-h-[100px] cursor-pointer hover:bg-neutral-50 ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-sm ${isToday ? 'bg-blue-500 text-white' : 'text-neutral-900'}`}>
                  {day}
                </span>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className={`mt-2 p-2 rounded-md text-xs cursor-pointer ${event.event_type === 'meeting' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">
                      {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
        employees={employees}
        event={null}
      />

      <EventOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => {
          setIsOptionsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        isCreator={selectedEvent?.created_by === employeeId}
        onUpdate={(event) => {
          setIsOptionsModalOpen(false);
          setSelectedDate(new Date(event.start_time));
          setSelectedEvent(event);
          setIsModalOpen(true);
        }}
        onDelete={null} // Disable delete for employees
      />
    </motion.div>
  );
}
