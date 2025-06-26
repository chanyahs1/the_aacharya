import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function MySales() {
  const [salesForms, setSalesForms] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMySales = async () => {
      const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
      if (!currentEmployee) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`https://the-aacharya.onrender.com/api/salespunches?employeeId=${currentEmployee.empID}`);
        const data = await response.json();
        setSalesForms(data);
      } catch (error) {
        setError('Error fetching sales forms');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySales();
  }, []);

  useEffect(() => {
    let filtered = salesForms;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filtered = filtered.filter(form => {
        const saleDate = new Date(form.dateOfSale);
        return saleDate >= start && saleDate <= end;
      });
    }
    if (searchTerm) {
      filtered = filtered.filter(form =>
        (form.studentName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSales(filtered);
  }, [salesForms, startDate, endDate, searchTerm]);

  const statusColor = (status) => {
    if (status === null) return 'bg-yellow-100 text-yellow-800';
    if (status) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const statusText = (status) => {
    if (status === null) return 'Pending';
    if (status) return 'Approved';
    return 'Rejected';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading sales data...</div>;
  }

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <TrendingUp className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Sales</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Sales Table Card */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">My Sales</h2>
          <p className="text-neutral-500 mb-4">View and filter your sales submissions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Search by Student Name</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Enter student name..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full bg-white rounded-xl border border-neutral-200">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Course Module</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Total Value</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date of Sale</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Approval Status</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Supervisor's Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-neutral-500">No sales found for the selected criteria.</td>
                  </tr>
                ) : (
                  filteredSales.map((form) => (
                    <tr key={form.id} className="hover:bg-primary-50 transition-colors">
                      <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-900">{form.course_module}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-900">{form.student_name}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-sm text-green-700 font-semibold">₹{form.total_package_value?.toLocaleString('en-IN') || 0}</td>
                      <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-700">{new Date(form.date_of_sale).toLocaleDateString()}</td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColor(form.isapproved)}`}>{statusText(form.isapproved)}</span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-sm text-neutral-700">{form.remarks || 'None'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}