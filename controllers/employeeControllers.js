import { signToken } from '../utils/jwt.js';
// ... other imports

export const loginEmployee = async (req, res) => {
  const { username, password, latitude, longitude } = req.body;

  const employee = await Employee.findOne({ username });

  if (!employee || employee.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ empID: employee.empID });

  res.json({
    empID: employee.empID,
    name: employee.name,
    department: employee.department,
    token,
  });
};
