import express from 'express';
import db from '../db.js';
const router = express.Router();


// HR Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM employees_table WHERE username = ? AND password = ? AND department = "HR"',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or not part of HR' });
    }

    const hr = rows[0];

    // Update last login
    await db.execute(
      'UPDATE employees_table SET lastLogin = NOW(), lastLogout = NULL, isActive = true WHERE id = ?',
      [hr.id]
    );

    res.json({ ...hr, isActive: true });
  } catch (err) {
    console.error('HR login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HR Logout Route
router.put('/logout/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      'UPDATE employees_table SET lastLogout = NOW(), isActive = false WHERE id = ?',
      [id]
    );

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;