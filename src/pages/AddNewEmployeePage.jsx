import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from '@heroicons/react/24/outline';

// Moved InputField outside of the component to prevent re-creation on render
const InputField = ({ label, name, type = 'text', required = true, value, onChange, children, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'select' ? (
      <select name={name} required={required} className="mt-1 block w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={value} onChange={onChange}>
        {children}
      </select>
    ) : (
      <input type={type} name={name} required={required} placeholder={placeholder || `Enter ${label.toLowerCase()}`} className="mt-1 block w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={value} onChange={onChange} />
    )}
  </div>
);

export default function AddNewEmployeePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    empID: '',
    email: '',
    personal_email: '',
    role: '',
    department: '',
    salary: '',
    username: '',
    password: '',
    state: '',
    district: '',
    gender: '',
  });

  const [existingEmployees, setExistingEmployees] = useState([]);

  const statesWithDistricts = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    "Delhi": ["New Delhi", "Central Delhi", "South Delhi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
    // Add more as needed
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://the-aacharya.onrender.com/api/employees');
        const data = await response.json();
        setExistingEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const generateEmpId = (department) => {
    if (!department) return '';
    const prefix = 'TA';
    const deptInitial = department.charAt(0).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const baseId = `${prefix}${deptInitial}D${year}`;

    const count = existingEmployees.filter(emp =>
      emp.empID?.startsWith(baseId)
    ).length;

    const newCount = String(count + 1).padStart(3, '0');
    return `${baseId}${newCount}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newEmpId = generateEmpId(formData.department);

    try {
      const response = await fetch('https://the-aacharya.onrender.com/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          empID: newEmpId,
          lastLogin: null,
          lastLogout: null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Employee added:', result);
        navigate('/employees');
      } else {
        console.error('Failed to add employee');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br p-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                    <UserPlusIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Employee</h1>
                <p className="text-gray-500 mt-2">Fill in the details below to create a new employee profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="First Name" name="name" value={formData.name} onChange={handleChange} />
                    <InputField label="Surname" name="surname" value={formData.surname} onChange={handleChange} />
                    <InputField label="Personal Email" name="personal_email" type="email" value={formData.personal_email} onChange={handleChange} />
                    <InputField label="Gender" name="gender" type="select" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </InputField>
                    <InputField label="State / UT" name="state" type="select" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })}>
                        <option value="">Select State</option>
                        {Object.keys(statesWithDistricts).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                    </InputField>
                    {formData.state && (
                      <InputField label="District" name="district" type="select" value={formData.district} onChange={handleChange}>
                        <option value="">Select District</option>
                        {statesWithDistricts[formData.state].map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                      </InputField>
                    )}
                  </div>
              </div>

              {/* Professional Information */}
              <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Professional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Department" name="department" type="select" value={formData.department} onChange={handleChange}>
                        <option value="">Select Department</option>
                        <option value="Sales">Sales</option>
                        <option value="Tech">Tech</option>
                        <option value="HR">HR</option>
                        <option value="Operations">Operations</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Others">Others</option>
                    </InputField>
                    <InputField label="Role" name="role" type="select" value={formData.role} onChange={handleChange}>
                        <option value="">Select Role</option>
                        <option value="Head of Department">Head of Department</option>
                        <option value="Area General Manager">Area General Manager</option>
                        <option value="Senior Manager">Senior Manager</option>
                        <option value="Manager">Manager</option>
                        <option value="Associate">Associate</option>
                        <option value="Executive">Executive</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Intern">Intern</option>
                        <option value="Business Development Associate">Business Development Associate</option>
                        <option value="Business Development Executive">Business Development Executive</option>
                        <option value="Business Development Trainee">Business Development Trainee</option>
                        <option value="Business Development Intern">Business Development Intern</option>
                        <option value="Senior Faculty">Senior Faculty</option>
                        <option value="Junior Faculty">Junior Faculty</option>
                        <option value="Principal">Principal</option>
                        <option value="Others">Others</option>
                    </InputField>
                    <InputField label="Official Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <InputField label="Monthly Salary (₹)" name="salary" type="number" value={formData.salary} onChange={handleChange} />
                  </div>
              </div>

              {/* Login Credentials */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Login Credentials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Username" name="username" value={formData.username} onChange={handleChange} />
                  <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                onClick={handleSubmit}>
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
