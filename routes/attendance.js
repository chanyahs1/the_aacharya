import express from 'express';
import db from '../db.js';
const router = express.Router();

// Get all employees with attendance for a specific date
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const [employees] = await db.execute(`
      SELECT 
        e.*,
        a.status as attendance_status
      FROM employees_table e
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
      ORDER BY e.name, e.surname
    `, [date]);
    res.json(employees);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance for today (Present or Absent)
router.post('/', async (req, res) => {
  try {
    const { employeeId, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const reqDate = today;

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if already marked
    const [existing] = await db.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, reqDate]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked for today.' });
    }

    await db.execute(
      'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
      [employeeId, reqDate, status]
    );
    res.status(201).json({ message: `Attendance marked as ${status}.` });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 