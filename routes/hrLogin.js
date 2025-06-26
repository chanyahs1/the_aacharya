
import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use env var in production

// HR Login Route
router.post('/login', async (req, res) => {
  const { username, password, latitude, longitude } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM employees_table WHERE username = ? AND password = ? AND department = "HR"',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or not part of HR' });
    }

    const hr = rows[0];

    // Update lastLogin, loginLatitude, loginLongitude
    await db.execute(
      `UPDATE employees_table 
       SET lastLogin = NOW(), lastLogout = NULL, isActive = true, 
           loginLatitude = ?, loginLongitude = ? 
       WHERE id = ?`,
      [latitude, longitude, hr.id]
    );

    // Insert into login_logs
    await db.execute(
      `INSERT INTO login_logs (empID, login_time, login_location) 
       VALUES (?, NOW(), ?)`,
      [hr.empID, `${latitude}, ${longitude}`]
    );

    // Create JWT payload
    const payload = {
      id: hr.id,
      username: hr.username,
      department: hr.department,
      name: hr.name,
      role: "hr"
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });

    // Remove password from response
    const { password: _, ...hrWithoutPassword } = hr;

    res.json({
      ...hrWithoutPassword,
      isActive: true,
      token
    });
  } catch (err) {
    console.error('HR login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// HR Logout Route
// HR Logout Route
router.put('/logout/:id', async (req, res) => {
  const { id } = req.params;
  const { logoutLatitude, logoutLongitude } = req.body;

  try {
    // ✅ Update employee table with logout details
    await db.execute(
      `UPDATE employees_table 
       SET lastLogout = NOW(), 
           isActive = false, 
           logoutLatitude = ?, 
           logoutLongitude = ? 
       WHERE id = ?`,
      [logoutLatitude, logoutLongitude, id]
    );

    // ✅ Optional: Insert into login_logs
    const [empRows] = await db.execute(
      'SELECT empID FROM employees_table WHERE id = ?',
      [id]
    );
    const empID = empRows[0]?.empID;

    if (empID) {
      await db.execute(
        `INSERT INTO login_logs (empID, logout_time, logout_location) 
         VALUES (?, NOW(), ?)`,
        [empID, `${logoutLatitude}, ${logoutLongitude}`]
      );
    }

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;