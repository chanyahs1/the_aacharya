import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from 'axios';

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  employees,
  event,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    attendees: [],
    meet_link: "", // new field
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const query = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.empID.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectAll) {
      // Unselect all
      setFormData((prev) => ({ ...prev, attendees: [] }));
    } else {
      // Select all filtered employees
      const allIds = filteredEmployees.map((emp) => emp.id.toString());
      setFormData((prev) => ({ ...prev, attendees: allIds }));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // If we're updating an event, use its data
        setFormData({
          title: event.title,
          description: event.description || "",
          startTime: new Date(event.start_time).toISOString().slice(0, 16),
          endTime: new Date(event.end_time).toISOString().slice(0, 16),
          attendees: event.attendees
            ? event.attendees.map((a) => a.id.toString())
            : [],
          meet_link: event.meet_link || "",
        });
      } else if (selectedDate) {
        // For new events, reset the form (no meet link yet)
        const dateStr = selectedDate.toISOString().split("T")[0];
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        setFormData({
          title: "",
          description: "",
          startTime: `${dateStr}T${hours}:${minutes}`,
          endTime: `${dateStr}T${String(now.getHours() + 1).padStart(2, "0")}:${minutes}`,
          attendees: [],
          meet_link: "",
        });
      }
    } else {
      // Clear form when closing
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        attendees: [],
        meet_link: "",
      });
      setSearchTerm("");
      setSelectAll(false);
    }
  }, [isOpen, selectedDate, event]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const startTime = new Date(formData.startTime);
  const endTime = new Date(formData.endTime);
  if (endTime <= startTime) {
    alert("End time must be after start time");
    setLoading(false);
    return;
  }

  try {
    const attendeeEmails = employees
      .filter(emp => formData.attendees.includes(emp.id.toString()))
      .map(emp => emp.email)
      .filter(email => !!email);

    const payload = {
      summary: formData.title,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      attendees: attendeeEmails,
    };

    let meetLink = formData.meet_link;
    if (!event) {
      const res = await axios.post("https://the-aacharya.onrender.com/api/create-meet", payload, { withCredentials: true });
      meetLink = res.data.meetLink;
    }

    onSubmit({ ...formData, meet_link: meetLink });
    onClose();
  } catch (err) {
    console.error("Meet creation error:", err);
    alert("Failed to create Google Meet link. Please re-authenticate or try again.");
  } finally {
    setLoading(false);
  }
};



  const handleTimeChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If changing start time, adjust end time to be 1 hour later
      if (field === "startTime" && value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        newData.endTime = endDate.toISOString().slice(0, 16);
      }

      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[80%] h-[80%] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">
            {event ? "Update Meeting" : "Schedule Meeting"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between h-full w-full space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter meeting title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter meeting description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                min={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Google Meet Link
            </label>
            <input
              type="text"
              value={formData.meet_link}
              readOnly
              className="w-full rounded-md border-neutral-300 bg-gray-100 shadow-sm"
              placeholder="Will be auto-generated"
            />
            {loading && <p className="text-xs text-blue-500 mt-1">Generating Google Meet link...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Attendees
            </label>

            <input
              type="text"
              placeholder="Search by name or empID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-2 rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />

            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <label htmlFor="selectAll" className="text-sm text-neutral-700">
                Select All
              </label>
            </div>

            <select
              multiple
              value={formData.attendees}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData((prev) => ({
                  ...prev,
                  attendees: selected,
                }));

                // If selected doesn't match all filtered employee IDs, uncheck Select All
                const allFilteredIds = filteredEmployees.map((emp) =>
                  emp.id.toString()
                );
                const isFullySelected =
                  selected.length === allFilteredIds.length &&
                  allFilteredIds.every((id) => selected.includes(id));
                setSelectAll(isFullySelected);
              }}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              size={6}
            >
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.empID} - {emp.name} {emp.surname} - {emp.department}{" "}
                  {emp.role}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-neutral-500">
              Hold Ctrl/Cmd to select/unselect multiple attendees
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {event ? "Update Meeting" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
