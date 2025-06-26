import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function DirectSession() {
  const [sessions, setSessions] = useState([]);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const currentEmployee =
          JSON.parse(localStorage.getItem("currentEmployee")) ||
          JSON.parse(sessionStorage.getItem("currentEmployee"));

        if (!currentEmployee?.empID) {
          console.error("Current employee not found.");
          return;
        }

        const response = await fetch("https://the-aacharya.onrender.com/api/directsession");
        const allSessions = await response.json();

        const mySessions = allSessions.filter(
          (session) =>
            String(session.employee_id) === String(currentEmployee.empID)
        );

        setSessions(mySessions);

        const initialEditData = {};
        mySessions.forEach((session) => {
          initialEditData[session.id] = {
            hodRemark: session.hod_remarks || "",
            status: session.status || "",
          };
        });
        setEditData(initialEditData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStatusUpdate = async (sessionId) => {
    const status = editData[sessionId]?.status;
    if (!status) return alert("Please select a status.");

    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/directsession/${sessionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Status updated successfully");
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? { ...session, status } : session
          )
        );
      } else {
        console.error("Update failed:", data.error);
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
    }
  };

  const handleSelfieUpdate = async (sessionId, file) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const formData = new FormData();
        formData.append("selfie", file);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);

        try {
          const res = await fetch(
            `https://the-aacharya.onrender.com/api/directsession/${sessionId}/selfie`,
            {
              method: "PUT",
              body: formData,
            }
          );

          const data = await res.json();

          if (res.ok) {
            alert("Selfie updated successfully!");
            setSessions((prev) =>
              prev.map((session) =>
                session.id === sessionId
                  ? { ...session, selfie: data.updatedSelfie || file.name }
                  : session
              )
            );
          } else {
            console.error("Upload failed:", data.error);
            alert("Failed to update selfie.");
          }
        } catch (err) {
          console.error("Upload error:", err);
          alert("Something went wrong.");
        }
      },
      (error) => {
        alert("Unable to fetch location. Please allow location access.");
        console.error("Geolocation error:", error);
      }
    );
  };

  // Filtering logic
  const filterSessions = (sessionsArr) => {
    let filtered = sessionsArr;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.session_datetime);
        return sessionDate >= start && sessionDate <= end;
      });
    }
    if (searchTerm) {
      filtered = filtered.filter((session) =>
        (session.student_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const statusColor = (status) => {
    if (status === "scheduled") return "bg-yellow-100 text-yellow-800";
    if (status === "purchased") return "bg-green-100 text-green-800";
    if (status === "not interested") return "bg-red-100 text-red-800";
    if (status === "follow up") return "bg-blue-100 text-blue-800";
    return "bg-neutral-100 text-neutral-700";
  };

  const renderTable = (title, filteredSessions) => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800">{title}</h2>
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full bg-white rounded-xl border border-neutral-200">
          <thead>
            <tr className="bg-neutral-100 text-sm">
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Student Name
              </th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Address
              </th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Selfie
              </th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 text-left font-semibold text-neutral-600 uppercase tracking-wider">
                Supervisor's Remark
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-10 text-neutral-500">
                  No sessions found for the selected criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-primary-50 transition-colors text-sm"
                >
                  <td className="py-3 px-4 whitespace-nowrap text-neutral-900">
                    {session.student_name} - {session.class}th
                    {session.contact_number}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-neutral-700">
                    {new Date(session.session_datetime).toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-neutral-900">
                    {session.address}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {session.selfie ? (
                      <a
                        href={`https://the-aacharya.onrender.com/uploads/${session.selfie}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 underline block mb-1"
                      >
                        View
                      </a>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleSelfieUpdate(session.id, file);
                        }}
                        className="mt-1 text-sm"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {session.status === "refunded" ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(
                          session.status
                        )}`}
                      >
                        Refunded
                      </span>
                    ) : (
                      <>
                        <select
                          value={editData[session.id]?.status || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              [session.id]: {
                                ...prev[session.id],
                                status: e.target.value,
                              },
                            }))
                          }
                          className="border border-neutral-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="purchased">Purchased</option>
                          <option value="follow up">Follow Up</option>
                          <option value="not interested">Not Interested</option>
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(session.id)}
                          className="ml-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Update
                        </button>
                      </>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-neutral-700">
                    {session.hod_remarks}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const upcomingSessions = filterSessions(
    sessions.filter((s) => s.status === "scheduled")
  );
  const conductedSessions = filterSessions(
    sessions.filter((s) => s.status !== "scheduled")
  );

  const currentEmployee = JSON.parse(localStorage.getItem("currentEmployee") || sessionStorage.getItem("currentEmployee"));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-9 h-9 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Direct Sessions</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Filter & Table Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">My Direct Sessions</h2>
          <p className="text-neutral-500 mb-4">View and filter your direct session submissions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Search by Student Name
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter student name..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {loading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-neutral-500">No direct sessions submitted yet.</p>
          ) : (
            <>
              {renderTable("Upcoming Sessions", upcomingSessions)}
              {renderTable("Conducted Sessions", conductedSessions)}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
