import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function EmployeeSalesReport() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        // Step 1: Get current employee
        const currentEmployee =
          JSON.parse(localStorage.getItem('currentEmployee')) ||
          JSON.parse(sessionStorage.getItem('currentEmployee'));

        if (!currentEmployee?.id) {
          console.error('Current employee not found in storage.');
          return;
        }

        // Step 2: Fetch hierarchy assignee IDs (recursive)
        const hierarchyResponse = await fetch(
          `http://localhost:5000/api/employees/${currentEmployee.id}/hierarchy-assignees`
        );
        const hierarchyData = await hierarchyResponse.json();

        if (!hierarchyData.assigneeIds) {
          console.error('Failed to get assignee IDs');
          return;
        }

        console.log('Assignee IDs (employees_table.id):', hierarchyData.assigneeIds);

        // Step 3: Get empIDs from these assignee IDs
        const empIdResponse = await fetch('http://localhost:5000/api/employees'); // assuming this returns all employees
        const allEmployees = await empIdResponse.json();

        const assigneeEmpIDs = allEmployees
          .filter(emp => hierarchyData.assigneeIds.includes(String(emp.id)))
          .map(emp => String(emp.empID)); // convert to string to match sales_punches

        console.log('Assignee EmpIDs (to match with sales_punches.employee_id):', assigneeEmpIDs);

        // Step 4: Fetch sales data
        const salesResponse = await fetch('http://localhost:5000/api/salespunches');
        const salesData = await salesResponse.json();

        // Step 5: Filter approved sales that match assignee empIDs
        const approvedSales = salesData.filter(
          sale =>
            sale.isapproved === 1 &&
            assigneeEmpIDs.includes(String(sale.employee_id))
        );

        console.log('Approved Sales:', approvedSales);

        // Step 6: Set final state
        setApprovedCount(approvedSales.length);
        setTotalRevenue(
          approvedSales.reduce((acc, sale) => acc + sale.final_course_value, 0)
        );
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Sales Report</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Approved Sales</h2>
          <p className="text-neutral-600">Number of Approved Sales: {approvedCount}</p>
          <p className="text-neutral-600">Total Revenue: ₹{totalRevenue.toFixed(2)}</p>
        </div>
      )}
    </motion.div>
  );
}
