import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all leave types
router.get('/types', async (req, res) => {
  try {
    const [types] = await db.execute('SELECT * FROM leave_types');
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a leave request
router.post('/request', async (req, res) => {
  const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = req.body;
  try {
    const [result] = await db.execute(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, leave_type_id, start_date, end_date, total_days, reason]
    );
    res.status(201).json({ id: result.insertId, ...req.body, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all leave requests for an employee
router.get('/requests/:employeeId', async (req, res) => {
  try {
    const [requests] = await db.execute(
      `SELECT lr.*, lt.name as leave_type_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.employee_id = ?
       ORDER BY lr.created_at DESC`,
      [req.params.employeeId]
    );
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending leave requests
router.get('/pending', async (req, res) => {
  try {
    const [requests] = await db.execute(`
      SELECT 
        lr.*,
        e.name as employee_name,
        e.surname as employee_surname,
        e.department as employee_department,
        e.role as employee_role,
        e.empID as employee_empID,
        e.leaves_taken as total_leaves_taken,
        lt.name as leave_type_name
      FROM leave_requests lr
      JOIN employees_table e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.status = 'Pending'
      ORDER BY lr.created_at DESC
    `);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching pending leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// HR: Approve or reject a leave request
// HR: Approve or reject a leave request
router.patch('/request/:id', async (req, res) => {
  const { status, remark } = req.body;
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT id FROM leave_requests WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (status === 'Rejected' && (!remark || remark.trim() === '')) {
      return res.status(400).json({ error: 'Remark is required when rejecting a leave request.' });
    }

    const updateQuery = `
      UPDATE leave_requests 
      SET status = ?, remark = ?
      WHERE id = ?
    `;
    await db.query(updateQuery, [status, remark || null, id]);

    res.json({ success: true, message: 'Leave request updated' });
  } catch (err) {
    console.error('Error updating leave request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Move this OUTSIDE the patch route
router.get('/previous', async (req, res) => {
  try {
    const query = `
      SELECT lr.*, e.name AS employee_name, e.surname AS employee_surname, 
             e.department AS employee_department, e.role AS employee_role, 
             e.empID AS employee_empID, lt.name AS leave_type_name
      FROM leave_requests lr
      JOIN employees_table e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.status != 'Pending'
      ORDER BY lr.start_date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching previous leave requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router; 