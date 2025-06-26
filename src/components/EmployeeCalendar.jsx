import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Calendar as CalendarIcon } from "lucide-react";
import EventModal from "./EventModal";
import EventOptionsModal from "./EventOptionsModal";

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
  const [unreadEventDates, setUnreadEventDates] = useState([]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
  }, [currentDate]);

  const currentEmployee =
    JSON.parse(localStorage.getItem("currentEmployee")) ||
    JSON.parse(sessionStorage.getItem("currentEmployee"));
  useEffect(() => {
    const fetchUnreadDates = async () => {
      try {
        const res = await fetch(
          `https://the-aacharya.onrender.com/api/employees/new-events/${employeeId}`
        );
        const data = await res.json();
        const dates = data.map((ev) => new Date(ev.start_time).toDateString());
        setUnreadEventDates(dates);

        // Mark as read after fetch
        await fetch(
          `https://the-aacharya.onrender.com/api/employees/mark-read/${employeeId}`,
          {
            method: "PUT",
          }
        );
      } catch (err) {
        console.error("Failed to fetch unread events", err);
      }
    };
    fetchUnreadDates();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/calendar-events?month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`
      );
      const data = await res.json();

      // Normalize attendees to IDs if necessary
      const filtered = data.filter((event) => {
        const attendeeIds =
          event.attendees?.map((a) => (typeof a === "object" ? a.id : a)) || [];
        return (
          event.created_by === employeeId || attendeeIds.includes(employeeId)
        );
      });

      setEvents(filtered);
      setError(null);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("https://the-aacharya.onrender.com/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      let data = await response.json();

      // Only show employees from same department if it's an employee
      if (currentEmployee) {
        data = data.filter(
          (emp) => emp.department === currentEmployee.department
        );
      }

      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleCreateEvent = async (formData) => {
    try {
      const res = await fetch(
        "https://the-aacharya.onrender.com/api/employees/calendar-events",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            createdBy: employeeId,
            attendees: formData.attendees.map((id) => parseInt(id)),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create event");
      await fetchEvents();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };
  const handleUpdateEvent = async (formData) => {
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/calendar-events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            attendees: formData.attendees.map((id) => parseInt(id)),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update event");

      await fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
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
      <div className="text-center p-6 text-neutral-600">
        Loading calendar...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <CalendarIcon className="w-9 h-9 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Calendar</h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                {currentEmployee?.full_name || currentEmployee?.name} |{" "}
                {currentEmployee?.empID} | {currentEmployee?.department}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </span>
            <button
              onClick={() =>
                setCurrentDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-neutral-50 p-4 text-center text-sm font-medium text-neutral-600"
              >
                {day}
              </div>
            ))}

            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-white p-4 min-h-[100px]" />
            ))}

            {days.map((day) => {
              const dayEvents = events.filter(
                (event) => new Date(event.start_time).getDate() === day
              );
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`bg-white p-4 min-h-[100px] cursor-pointer hover:bg-neutral-50 border border-transparent hover:border-blue-200 transition-all ${
                    isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                  }`}
                >
                  <span
                    className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                      isToday ? "bg-blue-500 text-white" : "text-neutral-900"
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`mt-2 p-2 rounded-md text-xs cursor-pointer font-medium transition-all ${
                        event.event_type === "meeting"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      } hover:shadow`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {new Date(event.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent} // ✅ use PUT if selectedEvent exists
        selectedDate={selectedDate}
        employees={employees}
        event={selectedEvent}
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
        onDelete={async (id) => {
          try {
            const res = await fetch(
              `https://the-aacharya.onrender.com/api/employees/calendar-events/${id}`,
              {
                method: "DELETE",
              }
            );

            if (!res.ok) throw new Error("Failed to delete event");

            // Refresh the calendar
            await fetchEvents();
            setIsOptionsModalOpen(false);
            setSelectedEvent(null);
          } catch (err) {
            console.error("Error deleting event:", err);
            alert("Failed to delete meeting.");
          }
        }}
        // Disable delete for employees
      />
    </motion.div>
  );
}
