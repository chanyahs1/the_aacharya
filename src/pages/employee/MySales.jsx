import React, { useEffect, useState } from 'react';

export default function MySales() {
  const [salesForms, setSalesForms] = useState([]);

  useEffect(() => {
    const fetchMySales = async () => {
      const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));
      if (!currentEmployee) return;

      try {
        const response = await fetch(`http://localhost:5000/api/salespunches?employeeId=${currentEmployee.empID}`);
        const data = await response.json();
        setSalesForms(data);
      } catch (error) {
        console.error('Error fetching sales forms:', error);
      }
    };

    fetchMySales();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">My Sales</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Course Module</th>
            <th className="py-2">Customer Email</th>
            <th className="py-2">Total Value</th>
            <th className="py-2">Approval Status</th>
            <th className="py-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {salesForms.map((form) => (
            <tr key={form.id} className="text-center">
              <td className="py-2">{form.courseModule}</td>
              <td className="py-2">{form.customerRegisteredEmail}</td>
              <td className="py-2">{form.totalPackageValue}</td>
              <td className="py-2">{form.isapproved === null ? 'Pending' : form.isapproved ? 'Approved' : 'Rejected'}</td>
              <td className="py-2">{form.remarks || 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}