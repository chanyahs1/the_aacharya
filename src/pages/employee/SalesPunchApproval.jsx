import React, { useEffect, useState } from "react";

export default function SalesPunchApproval() {
  const [salesPunches, setSalesPunches] = useState([]);
  const [selectedPunch, setSelectedPunch] = useState(null);

  useEffect(() => {
    fetchSalesPunches();
  }, []);

  const fetchSalesPunches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/salespunches");
      const data = await response.json();
      setSalesPunches(data);
    } catch (error) {
      console.error("Error fetching sales punches:", error);
    }
  };

  const updateSalesPunch = async (id, isapproved, remarks = null) => {
    try {
      await fetch(`http://localhost:5000/api/salespunches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isapproved, remarks }),
      });
      fetchSalesPunches();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleApprove = (id) => {
    const confirm = window.confirm("Are you sure you want to approve this sales punch?");
    if (confirm) {
      const remark = window.prompt("Optional: Add a remark before approving", "");
      updateSalesPunch(id, true, remark);
    }
  };

  const handleReject = (id) => {
    const confirm = window.confirm("Are you sure you want to reject this sales punch?");
    if (confirm) {
      const remark = window.prompt("Reason for rejection", "");
      updateSalesPunch(id, false, remark);
    }
  };

  const handleRemark = (id) => {
    const remark = window.prompt("Enter a remark:");
    if (remark !== null) {
      updateSalesPunch(id, null, remark);
    }
  };

  const pendingPunches = salesPunches.filter(p => p.isapproved === null);
const approvedPunches = salesPunches.filter(p => p.isapproved === true || p.isapproved === 1);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Sales Punch Approval</h1>

      {/* Pending Table */}
      <table className="min-w-full bg-white shadow-md mb-10">
        <thead>
          <tr>
            <th className="py-2 px-4">Employee ID</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Date of Sale</th>
            <th className="py-2 px-4">Course Module</th>
            <th className="py-2 px-4">View</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingPunches.map((punch) => (
            <tr key={punch.id} className="text-center border-t">
              <td className="py-2 px-4">{punch.employee_id}</td>
              <td className="py-2 px-4">{punch.name}</td>
              <td className="py-2 px-4">{punch.date_of_sale}</td>
              <td className="py-2 px-4">{punch.courseModule}</td>
              <td className="py-2 px-4">
                <button
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedPunch(punch)}
                >
                  View
                </button>
              </td>
              <td className="py-2 px-4">
                <button onClick={() => handleApprove(punch.id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Approve</button>
                <button onClick={() => handleReject(punch.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">Reject</button>
                <button onClick={() => handleRemark(punch.id)} className="bg-blue-500 text-white px-2 py-1 rounded">Remark</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approved Sales Table */}
      <h2 className="text-xl font-semibold mb-2">Approved Sales</h2>
      <table className="min-w-full bg-inherit shadow-sm">
        <thead>
          <tr>
            <th className="py-2 px-4">Employee ID</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Date of Sale</th>
            <th className="py-2 px-4">Course Module</th>
            <th className="py-2 px-4">View</th>
          </tr>
        </thead>
        <tbody>
          {approvedPunches.map((punch) => (
            <tr key={punch.id} className="text-center border-t">
              <td className="py-2 px-4">{punch.employee_id}</td>
              <td className="py-2 px-4">{punch.name}</td>
              <td className="py-2 px-4">{punch.date_of_sale}</td>
              <td className="py-2 px-4">{punch.courseModule}</td>
              <td className="py-2 px-4">
                <button
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedPunch(punch)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedPunch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Sales Punch Details</h2>
            <button
              className="absolute top-2 right-4 text-gray-600 hover:text-black text-2xl"
              onClick={() => setSelectedPunch(null)}
            >
              ✖
            </button>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 max-h-[70vh] overflow-y-auto px-4">
              {Object.entries(selectedPunch).map(([key, value]) => (
                <React.Fragment key={key}>
                  <div className="font-semibold capitalize text-right pr-2">
                    {key.replace(/_/g, " ")}:
                  </div>
                  <div className="text-left">{value || "-"}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
