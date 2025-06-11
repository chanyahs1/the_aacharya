import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AddNewEmployeePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    empID: '',
    email: '',
    role: '',
    department: '',
    salary: '',
    username: '',
    password: '',
  });

  const [existingEmployees, setExistingEmployees] = useState([]);

  // Fetch existing employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        const data = await response.json();
        setExistingEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Generate empID based on department and year
  const generateEmpId = (department) => {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newEmpId = generateEmpId(formData.department);

    try {
      const response = await fetch('http://localhost:5000/api/employees', {
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
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-semibold text-neutral-800 mb-6">Add New Employee</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">First Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Surname</label>
              <input
                type="text"
                name="surname"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Department</label>
              <select
                name="department"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Tech">Tech</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Faculty">Faculty</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
              <select
                name="role"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option value="Head of Department">Head of Department</option>
                <option value="Vice President">Vice President</option>
                <option value="Associate Vice President">Associate Vice President</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Manager">Manager</option>
                <option value="Associate">Associate</option>
                <option value="Executive">Executive</option>
                <option value="Trainee">Trainee</option>
                <option value="Intern">Intern</option>
                <option value="Associate">Business Development Associate</option>
                <option value="Executive">Business Development Executive</option>
                <option value="Trainee">Business Development Trainee</option>
                <option value="Intern">Business Development Intern</option>
                <option value="Senior Faculty">Senior Faculty</option>
                <option value="Faculty">Junior Faculty</option>
                <option value="Principal">Principal</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Salary (₹)</label>
              <input
                type="number"
                name="salary"
                required
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">Login Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
