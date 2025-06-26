import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Home, Banknote, Building, Briefcase, FileText,
  CreditCard, ShieldCheck, Key, Edit, UploadCloud, Eye
} from 'lucide-react';

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start py-3">
    <div className="flex-shrink-0 w-8 text-gray-500">{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-md text-gray-800">{value}</p>
    </div>
  </div>
);

const DocumentItem = ({ label, path }) => (
  <li className="flex items-center justify-between py-2 border-b last:border-0">
    <div className="flex items-center">
      <FileText className="w-5 h-5 text-gray-400 mr-3" />
      <span className="text-md text-gray-700">{label}</span>
    </div>
    {path ? (
      <a
        href={`https://the-aacharya.onrender.com/uploads/${path}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-200 transition"
      >
        <Eye className="w-4 h-4 mr-1.5" />
        View
      </a>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold">
        Not Uploaded
      </span>
    )}
  </li>
);

export default function EmployeeDetails() {
  const [employee, setEmployee] = useState(null);
  const [currentHR, setCurrentHR] = useState(null); // ✅ Added
  const [loading, setLoading] = useState(true);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDetails, setEditDetails] = useState(null);
  const [credentials, setCredentials] = useState({
    currentUsername: '',
    newUsername: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const hr = JSON.parse(sessionStorage.getItem('currentHR'));
    if (!hr || !hr.id) {
      console.error('No current employee found in session');
      setLoading(false);
      return;
    }

    setCurrentHR(hr); // ✅ Store in state
    const employeeId = hr.id;

    fetch(`https://the-aacharya.onrender.com/api/employees/details/${employeeId}`)
      .then(res => res.json())
      .then(data => {
        setEmployee(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch employee details:', err);
        setLoading(false);
      });
  }, []);

  const handleCredentialsChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSaveCredentials = async () => {
    const { currentUsername, newUsername, currentPassword, newPassword } = credentials;
    try {
      const res = await fetch(`https://the-aacharya.onrender.com/api/employees/changeCredentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUsername, newUsername, currentPassword, newPassword }),
      });
      if (res.ok) {
        alert('Credentials updated successfully. Logging out...');
        sessionStorage.removeItem('currentHR');
        window.location.href = '/login';
      } else {
        alert('Failed to update credentials. Please check your current username and password.');
      }
    } catch (err) {
      console.error('Error updating credentials:', err);
      alert('An error occurred while updating credentials.');
    }
  };

  const handleEditClick = () => {
    setEditDetails(employee);
    setShowEditModal(true);
  };

  const handleEditDetailsChange = (e) => {
    setEditDetails({ ...editDetails, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async () => {
    try {
      const res = await fetch(`https://the-aacharya.onrender.com/api/employees/details/${currentHR.id}`, { // ✅ Fixed
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDetails),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated);
        setShowEditModal(false);
        alert('Details updated successfully.');
      } else {
        alert('Failed to update details.');
      }
    } catch (err) {
      console.error('Error updating details:', err);
      alert('An error occurred while updating details.');
    }
  };

  if (loading) return <p className="text-center p-10">Loading employee details...</p>;
  if (!employee) return <p className="text-center p-10">No employee details found.</p>;
  
  const personalInfo = [
    { icon: <User size={20} />, label: 'Full Name', value: employee.full_name },
    { icon: <Mail size={20} />, label: 'Email', value: employee.email },
    { icon: <Mail size={20} />, label: 'Personal Email', value: employee.personal_email },
    { icon: <Phone size={20} />, label: 'Contact Number', value: employee.contact_number },
    { icon: <Briefcase size={20} />, label: 'Designation', value: employee.designation },
    { icon: <Building size={20} />, label: 'Department', value: employee.department },
    { icon: <User size={20} />, label: 'Role', value: employee.role },
    { icon: <Key size={20} />, label: 'Employee ID', value: employee.empID },
    { icon: <Banknote size={20} />, label: 'Salary', value: `₹${employee.salary}` },
    { icon: <User size={20} />, label: 'Marital Status', value: employee.marital_status },
    { icon: <User size={20} />, label: 'Gender', value: employee.gender },
    { icon: <Home size={20} />, label: 'Location', value: `${employee.location}, ${employee.district}, ${employee.state} - ${employee.pin_code}` },
    { icon: <UploadCloud size={20} />, label: 'Leaves Taken', value: employee.leaves_taken },
  ];

  const bankInfo = [
    { icon: <CreditCard size={20} />, label: 'Bank A/C Number', value: employee.bank_account_number },
    { icon: <ShieldCheck size={20} />, label: 'IFSC Code', value: employee.ifsc_code },
  ];

  const documentList = [
    { label: 'Resume', path: employee.resume_path },
    { label: 'Educational Certificates', path: employee.educational_certificates_path },
    { label: 'Relieving Letter', path: employee.relieving_letter_path },
    { label: 'Appointment Letter', path: employee.appointment_letter_path },
    { label: 'Experience Letter', path: employee.experience_letter_path },
    { label: 'Pay Slips', path: employee.pay_slips_path },
    { label: 'Passport Photo', path: employee.passport_photo_path },
    { label: 'Aadhar Card', path: employee.aadhar_card_path },
    { label: 'PAN Card', path: employee.pan_card_path },
    { label: 'Bank Statement', path: employee.bank_statement_path },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 min-h-screen p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="w-9 h-9 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Personal Details</h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <span className="font-semibold">{employee.full_name}</span> | {employee.empID} | {employee.department} - {employee.role}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleEditClick}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setShowCredentialsModal(true)}
            >
              <Key size={16} />
              Change Credentials
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0">
                {personalInfo.map(item => <DetailItem key={item.label} {...item} />)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Bank Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0">
                {bankInfo.map(item => <DetailItem key={item.label} {...item} />)}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Documents</h2>
            <ul className="space-y-1">
              {documentList.map(doc => <DocumentItem key={doc.label} {...doc} />)}
            </ul>
          </div>
        </div>
      </div>

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Change Credentials</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                onClick={() => setShowCredentialsModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Username</label>
                <input
                  type="text"
                  name="currentUsername"
                  value={credentials.currentUsername}
                  onChange={handleCredentialsChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Username</label>
                <input
                  type="text"
                  name="newUsername"
                  value={credentials.newUsername}
                  onChange={handleCredentialsChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={credentials.currentPassword}
                  onChange={handleCredentialsChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={credentials.newPassword}
                  onChange={handleCredentialsChange}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSaveCredentials}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Personal Details</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Contact Number', 'contact_number'],
                ['Marital Status', 'marital_status'],
                ['Gender', 'gender'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={'text'}
                    name={key}
                    value={editDetails[key] || ''}
                    onChange={handleEditDetailsChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitEdit}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
            >
              Submit Changes
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
