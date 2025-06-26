import React, { useEffect, useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  isBefore,
  isSameMonth,
  parseISO,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, BanknotesIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 8;

export default function SalaryManagementPage() {
  const [salaryRows, setSalaryRows] = useState({ pending: [], paid: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [bonusMap, setBonusMap] = useState({});
  const [paying, setPaying] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [paidPage, setPaidPage] = useState(1);

  useEffect(() => {
    fetchSalaryRows();
  }, [selectedMonth]);

  const fetchSalaryRows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const monthStr = format(selectedMonth, "yyyy-MM");
      const response = await fetch(`https://the-aacharya.onrender.com/api/salary?month=${monthStr}`);
      if (!response.ok) {
        throw new Error("Failed to fetch salary data");
      }
      const data = await response.json();
      setSalaryRows({
        pending: data.pending || [],
        paid: data.paid || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (direction) => {
    const newMonth = direction === "prev" ? subMonths(selectedMonth, 1) : addMonths(selectedMonth, 1);
    if (!isBefore(new Date(), newMonth)) {
      setSelectedMonth(newMonth);
    }
  };

  const handleBonusChange = (id, value) => {
    setBonusMap((prev) => ({ ...prev, [id]: value }));
  };

  const handlePaySalary = async (row) => {
    if (!window.confirm(`Are you sure you want to pay salary to ${row.full_name} (${row.empID}) for ${format(selectedMonth, "MMMM yyyy")}? This action cannot be undone.`)) {
      return;
    }
    setPaying((prev) => ({ ...prev, [row.employee_id]: true }));
    try {
      const bonus = parseFloat(bonusMap[row.employee_id]) || 0;
      const total = parseFloat(row.base_salary) + bonus;
      const payDate = format(new Date(), 'yyyy-MM-dd');
      const res = await fetch("https://the-aacharya.onrender.com/api/salary/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empID: row.empID,
          bonus,
          total: total,
          date_of_payment: payDate,
          for_month: format(selectedMonth, "yyyy-MM-01")
        }),
      });
      if (!res.ok) throw new Error("Failed to pay salary");
      await fetchSalaryRows();
      setBonusMap((prev) => ({ ...prev, [row.employee_id]: "" }));
    } catch (err) {
      alert(err.message);
    } finally {
      setPaying((prev) => ({ ...prev, [row.employee_id]: false }));
    }
  };

  const paidRows = useMemo(() => (salaryRows.paid || []).filter((row) => {
    if (!row.date_of_payment) return false;
    return isSameMonth(parseISO(row.date_of_payment), selectedMonth);
  }), [salaryRows.paid, selectedMonth]);

  const pendingRows = salaryRows.pending || [];

  const { uniqueRoles, uniqueDepartments } = useMemo(() => {
    const allRows = [...pendingRows, ...paidRows];
    const uniqueRoles = [...new Set(allRows.map((r) => r.role).filter(Boolean))];
    const uniqueDepartments = [...new Set(allRows.map((r) => r.department).filter(Boolean))];
    return { uniqueRoles, uniqueDepartments };
  }, [pendingRows, paidRows]);

  const filteredPendingRows = useMemo(() => {
    setPendingPage(1);
    return pendingRows.filter(row =>
      (!searchTerm || `${row.full_name} ${row.empID}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedRole || row.role === selectedRole) &&
      (!selectedDepartment || row.department === selectedDepartment)
    );
  }, [pendingRows, searchTerm, selectedRole, selectedDepartment]);

  const filteredPaidRows = useMemo(() => {
    setPaidPage(1);
    return paidRows.filter(row =>
      (!searchTerm || `${row.full_name} ${row.empID}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedRole || row.role === selectedRole) &&
      (!selectedDepartment || row.department === selectedDepartment)
    );
  }, [paidRows, searchTerm, selectedRole, selectedDepartment]);
  
  const { totalPendingAmount, totalPaidAmount, pendingEmployeesCount, paidEmployeesCount } = useMemo(() => {
    const pendingAmount = filteredPendingRows.reduce(
      (acc, row) => acc + parseFloat(row.base_salary) + (parseFloat(bonusMap[row.employee_id]) || 0),
      0
    );
    const paidAmount = filteredPaidRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0);
    return {
      totalPendingAmount: pendingAmount,
      totalPaidAmount: paidAmount,
      pendingEmployeesCount: filteredPendingRows.length,
      paidEmployeesCount: filteredPaidRows.length,
    };
  }, [filteredPendingRows, filteredPaidRows, bonusMap]);

  const paginatedPendingRows = filteredPendingRows.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE);
  const paginatedPaidRows = filteredPaidRows.slice((paidPage - 1) * ITEMS_PER_PAGE, paidPage * ITEMS_PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-gray-600 mt-1">Manage and disburse employee salaries.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button onClick={() => handleMonthChange('prev')} className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <DatePicker selected={selectedMonth} onChange={(date) => setSelectedMonth(date)} dateFormat="MMMM yyyy" showMonthYearPicker maxDate={new Date()} className="w-32 text-center font-semibold text-gray-700 border-none focus:ring-0 bg-transparent" />
            <button onClick={() => handleMonthChange('next')} disabled={isSameMonth(selectedMonth, new Date())} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-50">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<BanknotesIcon />} title="Total Pending Amount" value={`₹${totalPendingAmount.toLocaleString('en-IN')}`} color="yellow" isLoading={isLoading} />
            <StatCard icon={<CheckCircleIcon />} title="Total Paid Amount" value={`₹${totalPaidAmount.toLocaleString('en-IN')}`} color="green" isLoading={isLoading} />
            <StatCard icon={<UsersIcon />} title="Employees to Pay" value={pendingEmployeesCount} color="red" isLoading={isLoading} />
            <StatCard icon={<UsersIcon />} title="Employees Paid" value={paidEmployeesCount} color="blue" isLoading={isLoading} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Search Name or EmpID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full" />
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition w-full">
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              {(searchTerm || selectedRole || selectedDepartment) && (
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-2 border border-gray-300" onClick={() => { setSearchTerm(""); setSelectedRole(""); setSelectedDepartment(""); }}>
                      <XMarkIcon className="w-4 h-4" /> Clear
                  </button>
              )}
            </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Pending Salaries</h3>
                <p className="text-sm text-gray-500 mt-1">Salaries to be disbursed for {format(selectedMonth, "MMMM yyyy")}.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bonus</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (<tr><td colSpan={5} className="py-12 px-6 text-center text-gray-500">Loading...</td></tr>)
                        : paginatedPendingRows.length === 0 ? (<tr><td colSpan={5} className="py-12 px-6 text-center text-gray-500"><h3 className="text-lg font-medium">No pending salaries</h3><p className="text-sm text-gray-400">All salaries for this period are paid or no records found.</p></td></tr>)
                        : paginatedPendingRows.map((row) => (
                          <tr key={row.employee_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><div className="font-medium text-gray-900">{row.full_name}</div><div className="text-sm text-gray-500">{row.empID} | {row.department} - {row.role}</div></td>
                            <td className="px-6 py-4 text-sm text-gray-800">₹{parseFloat(row.base_salary).toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4"><input type="number" className="w-24 px-2 py-1 border rounded-md focus:ring-blue-500 focus:border-blue-500" value={bonusMap[row.employee_id] || ""} onChange={(e) => handleBonusChange(row.employee_id, e.target.value)} min="0" placeholder="Bonus" /></td>
                            <td className="px-6 py-4 font-bold text-gray-900">₹{(parseFloat(row.base_salary) + (parseFloat(bonusMap[row.employee_id]) || 0)).toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4"><button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 font-semibold shadow-sm" onClick={() => handlePaySalary(row)} disabled={paying[row.employee_id]}>{paying[row.employee_id] ? "Paying..." : "Pay Now"}</button></td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredPendingRows.length > ITEMS_PER_PAGE && <div className="p-4 border-t border-gray-200"><Pagination currentPage={pendingPage} totalItems={filteredPendingRows.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPendingPage} /></div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Paid Salaries</h3>
              <p className="text-sm text-gray-500 mt-1">Salaries already disbursed for {format(selectedMonth, "MMMM yyyy")}.</p>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bonus</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Paid</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date of Payment</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (<tr><td colSpan={5} className="py-12 px-6 text-center text-gray-500">Loading...</td></tr>)
                      : paginatedPaidRows.length === 0 ? (<tr><td colSpan={5} className="py-12 px-6 text-center text-gray-500"><h3 className="text-lg font-medium">No paid salaries found</h3><p className="text-sm text-gray-400">No salaries were paid for this month with the current filters.</p></td></tr>)
                      : paginatedPaidRows.map((row) => (
                        <tr key={row.employee_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><div className="font-medium text-gray-900">{row.full_name}</div><div className="text-sm text-gray-500">{row.empID} | {row.department} - {row.role}</div></td>
                          <td className="px-6 py-4 text-sm text-gray-800">₹{parseFloat(row.base_salary).toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">₹{parseFloat(row.bonus || 0).toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 font-bold text-green-700">₹{parseFloat(row.total || 0).toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4"><span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">{row.date_of_payment ? format(parseISO(row.date_of_payment), "dd MMM yyyy") : "-"}</span></td>
                        </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          {filteredPaidRows.length > ITEMS_PER_PAGE && <div className="p-4 border-t border-gray-200"><Pagination currentPage={paidPage} totalItems={filteredPaidRows.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPaidPage} /></div>}
        </div>
      </div>
    </motion.div>
  );
}

const StatCard = ({ icon, title, value, color, isLoading }) => {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{React.cloneElement(icon, { className: "h-6 w-6" })}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {isLoading ? <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse mt-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Previous</button>
        <button onClick={() => onPageChange(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};





