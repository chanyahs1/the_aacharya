import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { Users, Calendar, CheckCircle, RefreshCw, XCircle, Phone, Mail, MapPin, Camera, Save, AlertTriangle, Search } from 'lucide-react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        return null;
    }

    const handlePrev = () => {
        onPageChange(Math.max(currentPage - 1, 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(currentPage + 1, totalPages));
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                Next
            </button>
        </div>
    );
};

const SessionCard = ({ session, onRemarkChange, onSaveRemark, editData, onRefundClick, isPurchased, isRefunded, showSelfie = true }) => {
  return (
    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-2 items-start">
        
        {/* Student & Employee Info (col-span-4) */}
        <div className="sm:col-span-4">
          <p className="font-semibold text-gray-800">{session.student_name} ({session.class})</p>
          <p className="text-sm text-gray-500">{session.employee_name} ({session.employee_id})</p>
        </div>

        {/* Contact & Address Info (col-span-5) */}
        <div className="sm:col-span-5 text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2 truncate"><Mail size={14} className="flex-shrink-0" /> <span>{session.email}</span></div>
          <div className="flex items-center gap-2"><Phone size={14} className="flex-shrink-0" /> {session.contact_number}</div>
          <div className="flex items-center gap-2 truncate"><MapPin size={14} className="flex-shrink-0" /> <span>{session.address}</span></div>
        </div>
        
        {/* Date & Actions (col-span-3) */}
        <div className="sm:col-span-3 sm:text-right space-y-1">
            <p className="text-sm text-gray-500">{format(new Date(session.session_datetime), 'P p')}</p>
            <div className="flex flex-col items-end sm:justify-end gap-2">
              {showSelfie && (
                  <a href={`https://the-aacharya.onrender.com/uploads/${session.selfie}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-blue-600" aria-label="View Selfie">
                      <Camera size={18} />
                  </a>
              )}
              {/* Show selfie location if available and not in Scheduled Sessions */}
              {showSelfie && session.selfie_location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${session.selfie_location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                  style={{ wordBreak: 'break-all' }}
                >
                  <MapPin size={14} /> Selfie Location
                </a>
              )}
              {isPurchased && (
                  <button onClick={() => onRefundClick(session)} className="p-1.5 text-gray-500 hover:text-red-600" aria-label="Refund Session">
                      <RefreshCw size={18} />
                  </button>
              )}
            </div>
        </div>

        {/* Remark input (col-span-12) */}
        {!isRefunded && (
            <div className="sm:col-span-12 mt-2 pt-2 border-t border-gray-200">
                 <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="HOD Remark..."
                        value={editData[session.id]?.hodRemark || ''}
                        onChange={(e) => onRemarkChange(session.id, e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button onClick={() => onSaveRemark(session.id)} className="p-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition" aria-label="Save Remark">
                        <Save size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const SessionSection = ({ title, sessions, icon, ...props }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to page 1 if the total number of items changes (e.g. through filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [sessions.length]);

  if (sessions.length === 0) return null;
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = sessions.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
        {icon} {title}
      </h2>
      <div className="space-y-4">
        {currentSessions.map((session) => (
          <SessionCard key={session.id} session={session} {...props} />
        ))}
      </div>
      <Pagination
          totalItems={sessions.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
      />
    </div>
  );
};

export default function DirectSession() {
  const [sessions, setSessions] = useState([]);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionToRefund, setSessionToRefund] = useState(null);

  const currentEmployee =
    JSON.parse(localStorage.getItem("currentEmployee")) ||
    JSON.parse(sessionStorage.getItem("currentEmployee"));

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      if (!currentEmployee?.id) {
        setError("Current employee not found.");
        return;
      }

      const hierarchyResponse = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${currentEmployee.id}/hierarchy-assignees`
      );
      const hierarchyData = await hierarchyResponse.json();
      const assigneeIds = hierarchyData.assigneeIds?.map(String) || [];

      const empResponse = await fetch("https://the-aacharya.onrender.com/api/employees");
      const allEmployees = await empResponse.json();

      const assigneeEmpIDs = allEmployees
        .filter((emp) => assigneeIds.includes(String(emp.id)))
        .map((emp) => String(emp.empID));

      const sessionResponse = await fetch("https://the-aacharya.onrender.com/api/directsession");
      const allSessions = await sessionResponse.json();

      const filteredSessions = allSessions.filter((session) =>
        assigneeEmpIDs.includes(String(session.employee_id))
      );

      setSessions(filteredSessions);

      const initialEditData = {};
      filteredSessions.forEach((session) => {
        initialEditData[session.id] = { hodRemark: session.hod_remarks || "" };
      });
      setEditData(initialEditData);
      setError(null);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError("Failed to fetch sessions.");
    } finally {
      setLoading(false);
    }
  }, [currentEmployee?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSaveRemark = async (sessionId) => {
    try {
      await fetch(
        `https://the-aacharya.onrender.com/api/directsession/${sessionId}/hodremark`,
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

  const handleRemarkInputChange = (sessionId, value) => {
    setEditData((prev) => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], hodRemark: value },
    }));
  };

  const handleRefund = async () => {
    if (!sessionToRefund) return;
    try {
      await fetch(`https://the-aacharya.onrender.com/api/directsession/${sessionToRefund.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'refunded' }),
      });
      await fetchSessions();
    } catch (error) {
      console.error('Failed to refund session:', error);
      setError('Failed to process refund.');
    } finally {
      setSessionToRefund(null);
    }
  };

  const dateFilteredSessions = sessions.filter((session) => {
    const isDateInRange = (() => {
      if (!startDate || !endDate) return true;
      const sessionDate = new Date(session.session_datetime);
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      return sessionDate >= start && sessionDate <= end;
    })();

    if (!isDateInRange) return false;

    if (!searchTerm) return true;

    const searchTermLower = searchTerm.toLowerCase();
    return (
        (session.employee_name || '').toLowerCase().includes(searchTermLower) ||
        String(session.employee_id).toLowerCase().includes(searchTermLower)
    );
  });

  const scheduled = dateFilteredSessions.filter((s) => !s.status || s.status === "scheduled");
  const followUp = dateFilteredSessions.filter((s) => s.status?.toLowerCase() === "follow up");
  const purchased = dateFilteredSessions.filter((s) => s.status?.toLowerCase() === "purchased");
  const notInterested = dateFilteredSessions.filter((s) => s.status?.toLowerCase() === "not interested");
  const refunded = dateFilteredSessions.filter((s) => s.status?.toLowerCase() === 'refunded');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-9 h-9 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Direct Sessions</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="search" className="flex items-center text-md font-medium text-gray-700 mb-1"><Search size={18} className="mr-2" /> Search</label>
            <input 
                type="text" 
                id="search" 
                placeholder="Student Name or Employee ID..."
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="startDate" className="flex items-center text-md font-medium text-gray-700 mb-1"><Calendar size={18} className="mr-2" /> Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="endDate" className="flex items-center text-md font-medium text-gray-700 mb-1"><Calendar size={18} className="mr-2" /> End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? <p className="text-center text-gray-600 py-10">Loading...</p> : error ? <p className="text-center text-red-600 py-10">{error}</p> : (
          <div className="space-y-8">
            <SessionSection 
              title="Scheduled Sessions" 
              sessions={scheduled} 
              icon={<Calendar className="text-blue-500" />}
              showSelfie={false}
              onRemarkChange={handleRemarkInputChange} 
              onSaveRemark={handleSaveRemark} 
              editData={editData} 
            />
            <SessionSection 
              title="Follow Up Sessions" 
              sessions={followUp} 
              icon={<RefreshCw className="text-purple-500" />}
              onRemarkChange={handleRemarkInputChange} 
              onSaveRemark={handleSaveRemark} 
              editData={editData} 
            />
            <SessionSection 
              title="Purchased Sessions" 
              sessions={purchased} 
              icon={<CheckCircle className="text-green-500" />}
              onRemarkChange={handleRemarkInputChange} 
              onSaveRemark={handleSaveRemark} 
              editData={editData} 
              onRefundClick={setSessionToRefund} 
              isPurchased={true} 
            />
            <SessionSection 
              title="Rejected Sessions" 
              sessions={notInterested} 
              icon={<XCircle className="text-red-500" />}
              onRemarkChange={handleRemarkInputChange} 
              onSaveRemark={handleSaveRemark} 
              editData={editData} 
            />
            <SessionSection 
              title="Refunded Sessions" 
              sessions={refunded} 
              icon={<AlertTriangle className="text-orange-500" />}
              showSelfie={false} 
              onRemarkChange={() => {}} 
              onSaveRemark={() => {}} 
              editData={{}} 
              isRefunded={true} 
            />
          </div>
        )}
      </div>

      {sessionToRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-4 text-xl font-bold text-gray-800">Confirm Refund</h2>
              <p className="text-gray-600 my-4">Are you sure you want to mark this session as refunded? This action cannot be undone.</p>
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={() => setSessionToRefund(null)} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">No</button>
                <button onClick={handleRefund} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">Yes, Refund</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
