import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET attendance by date
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const [employees] = await db.execute(`
      SELECT 
        e.*,
        a.status AS attendance_status,
        a.remark AS attendance_remark,
        a.modified AS attendance_modified
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

// POST mark attendance
router.post('/', async (req, res) => {
  try {
    const { employeeId, status } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [existing] = await db.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked.' });
    }

    await db.execute(
      'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
      [employeeId, today, status]
    );
    res.status(201).json({ message: `Marked as ${status}` });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT modify attendance for any date
router.put('/', async (req, res) => {
  try {
    const { employeeId, status, remark, date } = req.body;

    if (!employeeId || !status || !remark || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    const [existing] = await db.execute(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, date]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Attendance not found for this date' });
    }

    await db.execute(
      'UPDATE attendance SET status = ?, remark = ?, modified = true WHERE employee_id = ? AND date = ?',
      [status, remark, employeeId, date]
    );

    res.status(200).json({ message: 'Attendance updated.' });
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
