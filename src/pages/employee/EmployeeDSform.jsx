import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function EmployeeDSform() {
  const [formData, setFormData] = useState({
    employeeId: '',
    studentName: '',
    class: '',
    board: '',
    school: '',
    fatherName: '',
    contactNumber: '',
    email: '',
    address: '',
    sessionDateTime: '',  // <-- renamed from selfie
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/directsession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Direct Session Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Other input fields remain unchanged */}
        <div>
          <label className="block text-neutral-600">Employee ID</label>
          <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Name of Student</label>
          <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Class</label>
          <input type="text" name="class" value={formData.class} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Board</label>
          <input type="text" name="board" value={formData.board} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">School</label>
          <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Father's Name</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Contact Number</label>
          <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Email ID</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>
        <div>
          <label className="block text-neutral-600">Full Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-neutral-300 rounded" />
        </div>

        {/* Date-Time Picker */}
        <div>
          <label className="block text-neutral-600">Select Date & Time</label>
          <input
            type="datetime-local"
            name="sessionDateTime"
            value={formData.sessionDateTime}
            onChange={handleChange}
            className="w-full p-2 border border-neutral-300 rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Done</button>
      </form>
    </motion.div>
  );
}
