import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  XMarkIcon,
  UserCircleIcon,
  AtSymbolIcon,
  PhoneIcon,
  BriefcaseIcon,
  MapPinIcon,
  BanknotesIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 5;

const textFields = [
    { label: "Full Name", key: "full_name", icon: UserCircleIcon },
    { label: "Email", key: "email", icon: AtSymbolIcon },
    { label: "Contact Number", key: "contact_number", icon: PhoneIcon },
    { label: "Marital Status", key: "marital_status", icon: UserGroupIcon },
    { label: "Designation", key: "designation", icon: BriefcaseIcon },
    { label: "Location", key: "location", icon: MapPinIcon },
    { label: "Pin Code", key: "pin_code", icon: MapPinIcon },
    { label: "Bank Account Number", key: "bank_account_number", icon: BanknotesIcon },
    { label: "IFSC Code", key: "ifsc_code", icon: BanknotesIcon },
  ];

  const documentFields = [
    { label: "Resume", key: "resume_path" },
    { label: "Educational Certificates", key: "educational_certificates_path" },
    { label: "Relieving Letter", key: "relieving_letter_path" },
    { label: "Appointment Letter", key: "appointment_letter_path" },
    { label: "Experience Letter", key: "experience_letter_path" },
    { label: "Pay Slips", key: "pay_slips_path" },
    { label: "Passport Photo", key: "passport_photo_path" },
    { label: "Aadhar Card", key: "aadhar_card_path" },
    { label: "PAN Card", key: "pan_card_path" },
    { label: "Bank Statement", key: "bank_statement_path" },
  ];

export default function OnboardingApprovals() {
  const [pendingForms, setPendingForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editFileData, setEditFileData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPendingForms = async () => {
      try {
        const res = await fetch(
          "https://the-aacharya.onrender.com/api/employees/new/pendingForms"
        );
        if (!res.ok) throw new Error("Failed to fetch pending forms");
        const data = await res.json();
        setPendingForms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingForms();
  }, []);

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData(employee);
    setEditFileData({});
    setEditMode(false);
    setShowDetailsModal(true);
  };

  const handleApprovalSubmit = async (employeeId, status) => {
    if (status === "yes") {
      try {
        await fetch(
          `https://the-aacharya.onrender.com/api/employees/approveForm/${employeeId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ onboarded: 1 }),
          }
        );
        setPendingForms(pendingForms.filter((form) => form.id !== employeeId));
      } catch (err) {
        console.error("Error approving form:", err);
      }
    }

    if (status === "no") {
      try {
        await fetch(
          `https://the-aacharya.onrender.com/api/employees/rejectForm/${employeeId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        setPendingForms(pendingForms.filter((form) => form.id !== employeeId));
      } catch (err) {
        console.error("Error rejecting form:", err);
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
        setEditFileData({ ...editFileData, [name]: files[0] });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();

    // Append text data
    for (const key in editFormData) {
        formData.append(key, editFormData[key]);
    }

    // Append file data
    for (const key in editFileData) {
        formData.append(key, editFileData[key]);
    }
    
    try {
      const res = await fetch(
        `https://the-aacharya.onrender.com/api/employees/updateDetails/${selectedEmployee.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (!res.ok) throw new Error('Update failed');
      
      const updatedEmployee = await res.json();
      
      // Update local state
      setPendingForms(forms => {
        const newForms = forms.map(f => f.id === updatedEmployee.id ? updatedEmployee : f);
        if(updatedEmployee.onboarded === 1) { // If approved, also update the selected employee in modal
          setSelectedEmployee(updatedEmployee);
        }
        return newForms;
      });
      

      alert("Details updated successfully!");
      setEditMode(false);
      setEditFileData({});

    } catch (error) {
      alert("Update failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-lg font-semibold text-gray-700">Loading...</div>
    </div>
  );
  if (error) return <div className="text-center py-10 text-red-500 text-lg">{error}</div>;

  const filteredForms = pendingForms.filter(form => {
      const fullName = form.full_name || '';
      const empId = form.empID || '';
      return (
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (empId && empId.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
  });
  
  const pendingApprovals = filteredForms.filter(form => form.onboarded === 2);
  const approvedOnboardings = filteredForms.filter(form => form.onboarded === 1);

  const paginatedPending = pendingApprovals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginatedApproved = approvedOnboardings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Onboarding Approvals</h1>
                <p className="mt-1 text-gray-600">Review and manage new employee onboarding submissions.</p>
            </div>
            <div className="relative w-full sm:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                type="text"
                placeholder="Search by name or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={<ClockIcon />}
            title="Pending Approvals"
            value={pendingApprovals.length}
            color="orange"
            isLoading={loading}
          />
          <StatCard
            icon={<CheckCircleIcon />}
            title="Approved Onboardings"
            value={approvedOnboardings.length}
            color="green"
            isLoading={loading}
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
           <div className="border-b border-gray-200">
             <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => handleTabClick('pending')}
                  className={`${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Pending Approvals
                </button>
                <button
                  onClick={() => handleTabClick('approved')}
                  className={`${
                    activeTab === 'approved'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Approved Onboardings
                </button>
             </nav>
           </div>
          
          {activeTab === 'pending' && (
            <Table
              employees={paginatedPending}
              onViewDetails={handleViewDetails}
              onApprove={(id) => handleApprovalSubmit(id, 'yes')}
              onReject={(id) => handleApprovalSubmit(id, 'no')}
              type="pending"
            />
          )}

          {activeTab === 'approved' && (
            <Table
              employees={paginatedApproved}
              onViewDetails={handleViewDetails}
              type="approved"
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={activeTab === 'pending' ? pendingApprovals.length : approvedOnboardings.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>


      {/* Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-start">
            <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <UserCircleIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.full_name}</h2>
                  <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedEmployee.onboarded === 1 && !editMode && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">
                  <CheckBadgeIcon className="w-5 h-5"/>
                  <span>Approved</span>
                </div>
              )}
              {!editMode && (
                  <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit
                  </button>
              )}
              <button
                className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                onClick={() => setShowDetailsModal(false)}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {editMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-8">
                    {/* Applicant Details */}
                    <div className="p-6 bg-gray-50/80 rounded-xl shadow-inner border">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-6">Applicant Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {textFields.map(({ label, key }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                <input type="text" value={editFormData[key] || ""} onChange={(e) => setEditFormData({...editFormData, [key]: e.target.value})} className="mt-1 block w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
                            </div>
                        ))}
                        </div>
                    </div>
                    {/* Documents */}
                    <div className="p-6 bg-gray-50/80 rounded-xl shadow-inner border">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-6">Submitted Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {documentFields.map(({ label, key }) => (
                            <div key={key} className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                                <div className="flex items-center space-x-4">
                                  <input type="file" name={key} onChange={handleFileChange} className="text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition w-full"/>
                                  {selectedEmployee[key] && <a href={`http://localhost:5000/${selectedEmployee[key]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline whitespace-nowrap text-sm">View Current</a>}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
                    <button type="button" onClick={() => {setEditMode(false); setEditFormData(selectedEmployee);}} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none" disabled={isSaving}>Cancel</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
          ) : (
            <div className="space-y-6">
                {/* Applicant Details */}
                <Section title="Applicant Details">
                    {textFields.map(({ label, key, icon: Icon }) => (
                        <DetailItem key={key} icon={<Icon/>} label={label} value={selectedEmployee[key] || 'N/A'} />
                    ))}
                </Section>
                 {/* Documents */}
                 <Section title="Submitted Documents">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-3">
                        {documentFields.map(({ label, key }) => (
                            <li key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="w-6 h-6 mr-3 text-gray-400"/>
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </div>
                                {selectedEmployee[key] ? (
                                    <a href={`http://localhost:5000/${selectedEmployee[key]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                                        View <DocumentArrowDownIcon className="w-5 h-5 ml-1.5"/>
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 font-medium">Not Provided</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>
            </div>
          )}
          </div>
        </motion.div>
      </div>
      )}
      </div>
    </motion.div>
  );
}

const Table = ({ employees, onViewDetails, onApprove, onReject, type }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {employees.length > 0 ? (
          employees.map((form) => (
            <tr key={form.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-800">{form.full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{form.empID}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{form.email}</div>
                  <div className="text-sm text-gray-500">{form.contact_number}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{form.designation}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => onViewDetails(form)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600 transition" title="View Details">
                  <EyeIcon className="w-5 h-5" />
                </button>
                {type === 'pending' && (
                  <>
                    <button onClick={() => onApprove(form.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-green-600 transition" title="Approve">
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onReject(form.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600 transition" title="Reject">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-12 px-6 text-gray-500">
              <h3 className="text-lg font-medium">No Employees Found</h3>
              <p className="text-sm text-gray-400">There are no {type} onboardings at this time.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const StatCard = ({ icon, title, value, color, isLoading }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center">
      <div className={`p-3 rounded-lg ${colors[color] || 'bg-gray-100 text-gray-600'}`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center col-span-1">
     {React.cloneElement(icon, { className: "w-6 h-6 mr-3 text-gray-400 flex-shrink-0"})}
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  </div>
);
