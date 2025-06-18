import React, { useEffect, useState } from "react";

export default function DirectSession() {
  const [sessions, setSessions] = useState([]);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);

        const currentEmployee =
          JSON.parse(localStorage.getItem("currentEmployee")) ||
          JSON.parse(sessionStorage.getItem("currentEmployee"));

        if (!currentEmployee?.id) {
          console.error("Current employee not found.");
          return;
        }

        const hierarchyResponse = await fetch(
          `http://localhost:5000/api/employees/${currentEmployee.id}/hierarchy-assignees`
        );
        const hierarchyData = await hierarchyResponse.json();
        const assigneeIds = hierarchyData.assigneeIds?.map(String) || [];

        const empResponse = await fetch("http://localhost:5000/api/employees");
        const allEmployees = await empResponse.json();

        const assigneeEmpIDs = allEmployees
          .filter((emp) => assigneeIds.includes(String(emp.id)))
          .map((emp) => String(emp.empID));

        const sessionResponse = await fetch("http://localhost:5000/api/directsession");
        const allSessions = await sessionResponse.json();

        const filteredSessions = allSessions.filter((session) =>
          assigneeEmpIDs.includes(String(session.employee_id))
        );

        setSessions(filteredSessions);

        const initialEditData = {};
        filteredSessions.forEach((session) => {
          initialEditData[session.id] = {
            hodRemark: session.hod_remarks || "",
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

  const handleRemarkChange = async (sessionId) => {
    try {
      await fetch(
        `http://localhost:5000/api/directsession/${sessionId}/hodremark`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hodRemark: editData[sessionId]?.hodRemark }),
        }
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, hod_remarks: editData[sessionId]?.hodRemark }
            : s
        )
      );
      alert("Remark added successfully!");
    } catch (error) {
      console.error("Error updating remark:", error);
      alert("Failed to add remark.");
    }
  };

  const handleEditChange = (sessionId, value) => {
    setEditData((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        hodRemark: value,
      },
    }));
  };

  const renderTable = (title, data) => (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-2 text-neutral-700">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 mb-4">No sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border">Student</th>
                <th className="py-2 px-3 border">Class</th>
                <th className="py-2 px-3 border">Father's Name</th>
                <th className="py-2 px-3 border">Contact</th>
                <th className="py-2 px-3 border">Email</th>
                <th className="py-2 px-3 border">Address</th>
                <th className="py-2 px-3 border">Scheduled Date</th>
                <th className="py-2 px-3 border">Selfie</th>
                <th className="py-2 px-3 border">Remark</th>
              </tr>
            </thead>
            <tbody>
              {data.map((session) => (
                <tr key={session.id} className="text-center">
                  <td className="py-2 px-3 border">{session.student_name}</td>
                  <td className="py-2 px-3 border">{session.class}</td>
                  <td className="py-2 px-3 border">{session.father_name}</td>
                  <td className="py-2 px-3 border">{session.contact_number}</td>
                  <td className="py-2 px-3 border">{session.email}</td>
                  <td className="py-2 px-3 border">{session.address}</td>
                  <td className="py-2 px-3 border">{session.session_datetime}</td>
                  <td className="py-2 px-3 border">
                    <a
                      href={`http://localhost:5000/uploads/${session.selfie}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                  <td className="py-2 px-3 border">
                    <input
                      type="text"
                      value={editData[session.id]?.hodRemark || ""}
                      onChange={(e) => handleEditChange(session.id, e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                    <button
                      onClick={() => handleRemarkChange(session.id)}
                      className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const scheduled = sessions.filter((s) => !s.status || s.status === "scheduled");
  const followUp = sessions.filter((s) => s.status?.toLowerCase() === "follow up");
  const purchased = sessions.filter((s) => s.status?.toLowerCase() === "purchased");
  const notInterested = sessions.filter((s) => s.status?.toLowerCase() === "not interested");

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Direct Sessions</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {renderTable("Scheduled Sessions", scheduled)}
          {renderTable("Follow Up Sessions", followUp)}
          {renderTable("Purchased Sessions", purchased)}
          {renderTable("Rejected Sessions", notInterested)}
        </>
      )}
    </div>
  );
}
