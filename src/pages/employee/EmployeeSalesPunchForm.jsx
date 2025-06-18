import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function EmployeeSalesPunchForm() {
  const [formData, setFormData] = useState({
    email: '',
    employeeId: '',
    name: '',
    contactNumber: '',
    officialEmail: '',
    reportingManager: '',
    courseModule: '',
    courseDuration: '',
    dateOfSale: '',
    customerRegisteredNumber: '',
    customerRegisteredEmail: '',
    totalPackageValue: '',
    scholarshipOffered: '',
    finalCourseValue: '',
    downPaymentAmount: '',
    paymentMode: '',
    paymentScreenshot: null,
    totalEmiAmount: '',
    monthlyEmi: '',
    documents: null,
    vendorName: '',
    studentName: '',
    class: '',
    schoolName: '',
    address: '',
    timeSlot: '',
    board: ''
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formDataToSend = new FormData();
  for (const key in formData) {
    if (formData[key]) {
      formDataToSend.append(key, formData[key]);
    }
  }

  try {
    const response = await fetch('http://localhost:5000/api/salespunch', {
      method: 'POST',
      body: formDataToSend,
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      alert('Form submitted successfully!');
    } else {
      alert(`Failed: ${data.error}`);
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('Failed to submit form.');
  }
};


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Sales Punch Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-neutral-600">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Employee Id *</label>
          <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Contact Number</label>
          <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Official Email</label>
          <input type="email" name="officialEmail" value={formData.officialEmail} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Reporting Manager</label>
          <input type="text" name="reportingManager" value={formData.reportingManager} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Course Module</label>
          <input type="text" name="courseModule" value={formData.courseModule} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Course Duration</label>
          <input type="text" name="courseDuration" value={formData.courseDuration} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Date of Sale</label>
          <input type="date" name="dateOfSale" value={formData.dateOfSale} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Customer Registered Number</label>
          <input type="tel" name="customerRegisteredNumber" value={formData.customerRegisteredNumber} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Customer Registered Email</label>
          <input type="email" name="customerRegisteredEmail" value={formData.customerRegisteredEmail} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Total Package Value</label>
          <input type="number" name="totalPackageValue" value={formData.totalPackageValue} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Scholarship/Discount Offered</label>
          <input type="number" name="scholarshipOffered" value={formData.scholarshipOffered} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Final Course Value</label>
          <input type="number" name="finalCourseValue" value={formData.finalCourseValue} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Down Payment Amount</label>
          <input type="number" name="downPaymentAmount" value={formData.downPaymentAmount} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Payment Mode for Down Payment</label>
          <input type="text" name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Payment Screenshot Uploaded</label>
          <input type="file" name="paymentScreenshot" onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Total Emi Amount</label>
          <input type="number" name="totalEmiAmount" value={formData.totalEmiAmount} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Monthly Emi</label>
          <input type="number" name="monthlyEmi" value={formData.monthlyEmi} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Documents</label>
          <input type="file" name="documents" onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Vendor name of loan provider</label>
          <input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Student Name</label>
          <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Class</label>
          <input type="text" name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">School Name</label>
          <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Suitable Time slot</label>
          <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded">
            <option value="">Select a time slot</option>
            <option value="1PM-2PM">1PM-2PM</option>
            <option value="1:30PM-2:30PM">1:30PM-2:30PM</option>
            <option value="2PM-3PM">2PM-3PM</option>
            <option value="2:30PM-3:30PM">2:30PM-3:30PM</option>
            <option value="3PM-4PM">3PM-4PM</option>
            <option value="3:30PM-4:30PM">3:30PM-4:30PM</option>
            <option value="4PM-5PM">4PM-5PM</option>
            <option value="4:30PM-5:30PM">4:30PM-5:30PM</option>
            <option value="5PM-6PM">5PM-6PM</option>
            <option value="5:30PM-6:30PM">5:30PM-6:30PM</option>
            <option value="6PM-7PM">6PM-7PM</option>
            <option value="6:30PM-7:30PM">6:30PM-7:30PM</option>
            <option value="7PM-8PM">7PM-8PM</option>
            <option value="7:30PM-8:30PM">7:30PM-8:30PM</option>
            <option value="8PM-9PM">8PM-9PM</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-neutral-600">Board</label>
          <input type="text" name="board" value={formData.board} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
    </motion.div>
  );
}
