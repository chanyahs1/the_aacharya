import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { DollarSign, CheckCircle, Eye, Calendar, User, Search, RefreshCw, Info, X, ClipboardCheck } from 'lucide-react';

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

const StatCard = ({ title, value, icon, prefix = "" }) => (
  <div className="bg-white p-5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 border-green-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">
          {prefix}{value.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    </div>
  </div>
);

const SaleCard = ({ punch, onViewClick, onRefundClick, isRefunded = false }) => (
  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-2 items-center">
      
      {/* Employee Info (col-span-4) */}
      <div className="sm:col-span-4">
        <p className="font-semibold text-gray-800">{punch.name}</p>
        <p className="text-sm text-gray-500">{punch.employee_id}</p>
      </div>

      {/* Course & Date (col-span-5) */}
      <div className="sm:col-span-5 text-sm">
        <p className="text-gray-700">{punch.course_module || punch.courseModule}</p>
        <p className="text-gray-500">{format(new Date(punch.date_of_sale), "P")}</p>
      </div>

      {/* Value & Actions (col-span-3) */}
      <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2">
        {!isRefunded && (
          <p className="font-semibold text-green-600">
            ₹{punch.final_course_value?.toLocaleString("en-IN") || '0'}
          </p>
        )}
        <div className="flex items-center gap-1">
          <button onClick={() => onViewClick(punch)} className="p-1.5 text-gray-500 hover:text-blue-600" aria-label="View Details">
            <Eye size={18} />
          </button>
          {!isRefunded && (
            <button onClick={() => onRefundClick(punch.id)} className="p-1.5 text-gray-500 hover:text-red-600" aria-label="Refund Sale">
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SalesSection = ({ title, sales, onViewClick, onRefundClick, isRefunded = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-neutral-500 text-center py-4">No sales found in this category.</p>
      </div>
    );
  }
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-3">
        {currentSales.map((punch) => (
          <SaleCard 
            key={punch.id} 
            punch={punch} 
            onViewClick={onViewClick}
            onRefundClick={onRefundClick}
            isRefunded={isRefunded}
          />
        ))}
      </div>
      <Pagination
        totalItems={sales.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default function EmployeeSalesReport() {
  const [approvedSales, setApprovedSales] = useState([]);
  const [refundedSales, setRefundedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPunch, setSelectedPunch] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refundPunchId, setRefundPunchId] = useState(null);

  const currentEmployee =
    JSON.parse(localStorage.getItem('currentEmployee')) ||
    JSON.parse(sessionStorage.getItem('currentEmployee'));

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      if (!currentEmployee?.id) {
        setError('Current employee not found.');
        setLoading(false);
        return;
      }

      const hierarchyResponse = await fetch(
        `https://the-aacharya.onrender.com/api/employees/${currentEmployee.id}/hierarchy-assignees`
      );
      const hierarchyData = await hierarchyResponse.json();

      if (!hierarchyData.assigneeIds) {
        setError('Failed to get assignee IDs.');
        setLoading(false);
        return;
      }

      const empIdResponse = await fetch('https://the-aacharya.onrender.com/api/employees');
      const allEmployees = await empIdResponse.json();

      const assigneeEmpIDs = allEmployees
        .filter(emp => hierarchyData.assigneeIds.includes(String(emp.id)))
        .map(emp => String(emp.empID));

      const salesResponse = await fetch('https://the-aacharya.onrender.com/api/salespunches');
      const salesData = await salesResponse.json();

      const teamSales = salesData.filter(sale => assigneeEmpIDs.includes(String(sale.employee_id)));

      const approved = teamSales.filter(sale => sale.isapproved === 1 || sale.isapproved === true);
      const refunded = teamSales.filter(sale => sale.isapproved === 3);

      setApprovedSales(approved);
      setRefundedSales(refunded);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to fetch sales data.');
    } finally {
      setLoading(false);
    }
  }, [currentEmployee?.id]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleConfirmRefund = async () => {
    if (!refundPunchId) return;

    try {
      await fetch(`https://the-aacharya.onrender.com/api/salespunches/${refundPunchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isapproved: 3, final_course_value: 0 }),
      });
      await fetchSalesData();
    } catch (err) {
      console.error("Refund failed:", err);
      setError("Failed to process refund.");
    } finally {
      setRefundPunchId(null);
    }
  };

  const filteredApprovedSales = approvedSales.filter((punch) => {
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

  const filteredRefundedSales = refundedSales.filter((punch) => {
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

  const filteredRevenue = filteredApprovedSales.reduce((acc, sale) => acc + (sale.final_course_value || 0), 0);
  const filteredCount = filteredApprovedSales.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <ClipboardCheck className="w-9 h-9 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="search" className="flex items-center text-md font-medium text-gray-700 mb-1"><Search size={18} className="mr-2" /> Search Employee</label>
            <input 
                type="text" 
                id="search" 
                placeholder="Search by name or ID..."
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
        
        {loading ? <p className="text-center text-gray-600">Loading...</p> : error ? <p className="text-center text-red-600">{error}</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Approved Sales" value={filteredCount} icon={<CheckCircle size={28} className="text-green-500" />} />
              <StatCard title="Total Revenue" value={filteredRevenue} prefix="₹" icon={<DollarSign size={28} className="text-green-500" />} />
            </div>
            
            <SalesSection 
              title="Approved Sales Details"
              sales={filteredApprovedSales}
              onViewClick={setSelectedPunch}
              onRefundClick={setRefundPunchId}
            />

            <SalesSection
              title="Refunded Sales Details"
              sales={filteredRefundedSales}
              onViewClick={setSelectedPunch}
              isRefunded={true}
            />
          </>
        )}
      </div>

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
                    <p className="text-md text-gray-900">{String(value) || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {refundPunchId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">Confirm Refund</h2>
              <p className="text-gray-600 my-4">Are you sure you want to refund this sale? This action cannot be undone.</p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setRefundPunchId(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmRefund}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Yes, Refund
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
