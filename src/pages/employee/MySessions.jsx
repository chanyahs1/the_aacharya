import React, { useEffect, useState } from 'react';

export default function DirectSession() {
  const [sessions, setSessions] = useState([]);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const currentEmployee =
          JSON.parse(localStorage.getItem('currentEmployee')) ||
          JSON.parse(sessionStorage.getItem('currentEmployee'));

        if (!currentEmployee?.empID) {
          console.error('Current employee not found.');
          return;
        }

        const response = await fetch('http://localhost:5000/api/directsession');
        const allSessions = await response.json();

        const mySessions = allSessions.filter(
          session => String(session.employee_id) === String(currentEmployee.empID)
        );

        setSessions(mySessions);

        const initialEditData = {};
        mySessions.forEach((session) => {
          initialEditData[session.id] = {
            hodRemark: session.hod_remarks || '',
            status: session.status || '',
          };
        });
        setEditData(initialEditData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStatusUpdate = async (sessionId) => {
    const status = editData[sessionId]?.status;
    if (!status) return alert('Please select a status.');

    try {
      const res = await fetch(`http://localhost:5000/api/directsession/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Status updated successfully');
        setSessions(prev =>
          prev.map(session =>
            session.id === sessionId ? { ...session, status } : session
          )
        );
      } else {
        console.error('Update failed:', data.error);
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong');
    }
  };

  const handleSelfieUpdate = async (sessionId, file) => {
    const formData = new FormData();
    formData.append('selfie', file);

    try {
      const res = await fetch(`http://localhost:5000/api/directsession/${sessionId}/selfie`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert('Selfie updated successfully!');
        setSessions(prev =>
          prev.map(session =>
            session.id === sessionId
              ? { ...session, selfie: data.updatedSelfie || file.name }
              : session
          )
        );
      } else {
        console.error('Upload failed:', data.error);
        alert('Failed to update selfie.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Something went wrong.');
    }
  };

  const renderTable = (title, filteredSessions) => (
    <>
      <h2 className="text-xl font-semibold mt-8 mb-2">{title}</h2>
      <table className="min-w-full bg-white border mb-6">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="py-2 px-4 border">Student Name</th>
            <th className="py-2 px-4 border">Class</th>
            <th className="py-2 px-4 border">Father's Name</th>
            <th className="py-2 px-4 border">Contact</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Address</th>
            <th className="py-2 px-4 border">Selfie</th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Supervisor's Remark</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session) => (
            <tr key={session.id} className="text-center text-sm">
              <td className="py-2 px-4 border">{session.student_name}</td>
              <td className="py-2 px-4 border">{session.class}</td>
              <td className="py-2 px-4 border">{session.father_name}</td>
              <td className="py-2 px-4 border">{session.contact_number}</td>
              <td className="py-2 px-4 border">{session.email}</td>
              <td className="py-2 px-4 border">{session.address}</td>
              <td className="py-2 px-4 border">
                {session.selfie ? (
  <>
    <a
      href={`http://localhost:5000/uploads/${session.selfie}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline block mb-1"
    >
      View
    </a>
  </>
) : (
  <>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) handleSelfieUpdate(session.id, file);
      }}
      className="mt-1 text-sm"
    />
      </>
)}

              </td>
              <td className="py-2 px-4 border">
                <select
                  value={editData[session.id]?.status || ''}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      [session.id]: {
                        ...prev[session.id],
                        status: e.target.value,
                      },
                    }))
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="">Select</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="purchased">Purchased</option>
                  <option value="follow up">Follow Up</option>
                  <option value="not interested">Not Interested</option>
                </select>
                <button
                  onClick={() => handleStatusUpdate(session.id)}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </td>
              <td className="py-2 px-4 border">{session.hod_remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const upcomingSessions = sessions.filter(s => s.status === "scheduled");
  const conductedSessions = sessions.filter(s => s.status !== "scheduled");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">My Direct Sessions</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-600">No direct sessions submitted yet.</p>
      ) : (
        <>
          {renderTable("Upcoming Sessions", upcomingSessions)}
          {renderTable("Conducted Sessions", conductedSessions)}
        </>
      )}
    </div>
  );
}
