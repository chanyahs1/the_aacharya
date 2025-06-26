import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, X, MessageSquare, Eye, Calendar, User, Tag, ClipboardCheck, Info, Search } from 'lucide-react';

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

export default function SalesPunchApproval() {
  const [salesPunches, setSalesPunches] = useState([]);
  const [selectedPunch, setSelectedPunch] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");

  // State for remark modal
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: null, punchId: null });
  const [remarkText, setRemarkText] = useState("");

  useEffect(() => {
    fetchSalesPunches();
  }, []);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchTerm]);

  const fetchSalesPunches = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://the-aacharya.onrender.com/api/salespunches");
      const data = await response.json();
      setSalesPunches(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching sales punches:", error);
      setError("Failed to fetch sales punches.");
    } finally {
      setLoading(false);
    }
  };

  const updateSalesPunch = async (id, isapproved, remarks = null) => {
    try {
      await fetch(`https://the-aacharya.onrender.com/api/salespunches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isapproved, remarks }),
      });
      fetchSalesPunches(); // Refresh data
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update sales punch.");
    }
  };

  const openRemarkModal = (type, punchId) => {
    setCurrentAction({ type, punchId });
    setRemarkText("");
    setIsRemarkModalOpen(true);
  };

  const handleRemarkSubmit = () => {
    const { type, punchId } = currentAction;
    if (type === 'reject' && !remarkText) {
      alert("A reason for rejection is required.");
      return;
    }
    if (type === 'remark' && !remarkText) {
      alert("A remark is required.");
      return;
    }
    
    let approvalStatus = null;
    if (type === 'approve') approvalStatus = true;
    if (type === 'reject') approvalStatus = false;

    updateSalesPunch(punchId, approvalStatus, remarkText);

    setIsRemarkModalOpen(false);
  };

  const dateFilteredPunches = salesPunches.filter((punch) => {
    const isDateInRange = (() => {
      if (!startDate || !endDate) return true;
      const punchDate = new Date(punch.date_of_sale);
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      return punchDate >= start && punchDate <= end;
    })();

    if (!isDateInRange) return false;

    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (punch.name || '').toLowerCase().includes(searchTermLower) ||
      String(punch.employee_id).toLowerCase().includes(searchTermLower)
    );
  });

  const pendingPunches = dateFilteredPunches.filter((p) => p.isapproved === null);
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPunches = pendingPunches.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  // Card layout for punch entries
  const PunchCard = ({ punch, isPending }) => (
    <motion.div
      variants={itemVariants}
      className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><User size={20} /></div>
        <div>
          <p className="font-medium text-gray-900">{punch.name}</p>
          <p className="text-sm text-gray-500">{punch.employee_id}</p>
          <p className="text-sm text-gray-500 mt-1">{punch.course_module}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <span className="text-sm text-neutral-500">Sale Date: {format(new Date(punch.date_of_sale), "MMMM d, yyyy")}</span>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => setSelectedPunch(punch)} className="p-2 text-gray-600 hover:text-blue-600 transition"><Eye size={20} /></button>
          {isPending && (
            <>
              <button onClick={() => openRemarkModal('approve', punch.id)} className="p-2 text-gray-600 hover:text-green-600 transition"><Check size={20} /></button>
              <button onClick={() => openRemarkModal('reject', punch.id)} className="p-2 text-gray-600 hover:text-red-600 transition"><X size={20} /></button>
              <button onClick={() => openRemarkModal('remark', punch.id)} className="p-2 text-gray-600 hover:text-purple-600 transition"><MessageSquare size={20} /></button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <ClipboardCheck className="w-9 h-9 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Punch Approval</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Filters Card */}
        <motion.div variants={itemVariants} className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="search" className="flex items-center text-md font-medium text-gray-700 mb-1"><Search size={18} className="mr-2" /> Search</label>
            <input 
                type="text" 
                id="search" 
                placeholder="Name or Employee ID..."
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
        </motion.div>

        {loading ? <p className="text-center text-gray-600">Loading...</p> : error ? <p className="text-center text-red-600">{error}</p> : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Approvals</h2>
            <div className="space-y-4">
              {currentPunches.length > 0 ? (
                currentPunches.map((punch) => (
                  <PunchCard key={punch.id} punch={punch} isPending={true} />
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No entries found.</p>
              )}
            </div>
            <Pagination
              totalItems={pendingPunches.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPunch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Info size={24}/>Sales Punch Details</h2>
              <button onClick={() => setSelectedPunch(null)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(selectedPunch).map(([key, value]) => (
                  <div key={key} className="py-2 border-b">
                    <p className="text-sm font-semibold capitalize text-gray-600">{key.replace(/_/g, " ")}</p>
                    <p className="text-md text-gray-900">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remark Modal */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 capitalize">{currentAction.type} Sales Punch</h2>
              <button onClick={() => setIsRemarkModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
            </div>
            <div className="p-6">
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2">
                {currentAction.type === 'approve' ? 'Optional Remarks' : 'Reason / Remarks'}
              </label>
              <textarea
                id="remark"
                rows="4"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={currentAction.type === 'reject' ? "Reason for rejection is required" : "Add remarks here..."}
              ></textarea>
              <button
                onClick={handleRemarkSubmit}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
