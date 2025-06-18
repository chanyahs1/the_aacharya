import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    maritalStatus: '',
    designation: '',
    resume: null,
    educationalCertificates: [],
    relievingLetter: null,
    appointmentLetter: null,
    experienceLetter: null,
    paySlips: [],
    passportPhoto: null,
    location: '',
    pinCode: '',
    aadharCard: [],
    panCard: [],
    bankAccountNumber: '',
    ifscCode: '',
    bankStatement: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['fullName', 'email', 'contactNumber', 'designation', 'location', 'pinCode', 'bankAccountNumber', 'ifscCode'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }

    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] instanceof FileList) {
          Array.from(formData[key]).forEach(file => {
            formDataToSend.append(key, file);
          });
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/employees/onboarding', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      alert('Form submitted successfully!');
      // Reset form or redirect as needed
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Employee Onboarding Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.fullName ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="First and Last Name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-error-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Write the correct Email Address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.contactNumber ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Enter your contact number"
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-error-600">{errors.contactNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Professional Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Designation *
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.designation ? 'border-error-500' : 'border-neutral-300'
                }`}
              >
                <option value="">Select Designation</option>
                <option value="Software Engineer">Senior Manager</option>
                <option value="Senior Software Engineer">Manager</option>
                <option value="Project Manager">Business Development Associate</option>
                <option value="Team Lead">Human Resource</option>
                <option value="Other">Other</option>
              </select>
              {errors.designation && (
                <p className="mt-1 text-sm text-error-600">{errors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Resume *
              </label>
              <input
                type="file"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file: PDF, document or image. Max 10 MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Educational Certificates *
              </label>
              <input
                type="file"
                name="educationalCertificates"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload up to 5 supported files: PDF, document or image. Max 10 MB per file.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Relieving Letter/Resignation Acceptance Letter
              </label>
              <input
                type="file"
                name="relievingLetter"
                onChange={handleFileChange}
                accept=".pdf"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file: PDF. Max 1 MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Appointment Letter
              </label>
              <input
                type="file"
                name="appointmentLetter"
                onChange={handleFileChange}
                accept=".pdf"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file. Max 1 MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Experience Letter
              </label>
              <input
                type="file"
                name="experienceLetter"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file: PDF, document or image. Max 10 MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Pay Slips (3 months) *
              </label>
              <input
                type="file"
                name="paySlips"
                onChange={handleFileChange}
                accept=".pdf"
                multiple
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload up to 5 supported files: PDF. Max 10 MB per file.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Passport Size Photo *
              </label>
              <input
                type="file"
                name="passportPhoto"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file. Max 10 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Address Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.location ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Provide your location as per the Aadhar Card"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-error-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                PIN Code *
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.pinCode ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Enter your PIN code"
              />
              {errors.pinCode && (
                <p className="mt-1 text-sm text-error-600">{errors.pinCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Document Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Aadhar Card *
              </label>
              <input
                type="file"
                name="aadharCard"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload up to 5 supported files: PDF, document or image. Max 10 MB per file.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                PAN Card *
              </label>
              <input
                type="file"
                name="panCard"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload up to 5 supported files: PDF, document or image. Max 10 MB per file.
              </p>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Bank Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bank Account Number *
              </label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.bankAccountNumber ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Enter your bank account number"
              />
              {errors.bankAccountNumber && (
                <p className="mt-1 text-sm text-error-600">{errors.bankAccountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 ${
                  errors.ifscCode ? 'border-error-500' : 'border-neutral-300'
                }`}
                placeholder="Enter your IFSC code"
              />
              {errors.ifscCode && (
                <p className="mt-1 text-sm text-error-600">{errors.ifscCode}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cancelled Cheque/Bank Statement/Bank Passbook
              </label>
              <input
                type="file"
                name="bankStatement"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-neutral-500">
                Upload 1 supported file: PDF, document or image. Max 10 MB.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 