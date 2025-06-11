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
router.patch('/request/:id', async (req, res) => {
  const { status } = req.body;
  console.log('Updating leave request:', { id: req.params.id, status });

  try {
    // First get the leave request details
    const [leaveRequest] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ?',
      [req.params.id]
    );
    console.log('Leave request found:', leaveRequest[0]);

    if (leaveRequest.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const request = leaveRequest[0];

    // Update the leave request status
    const [updateResult] = await db.execute(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    console.log('Leave request status updated:', updateResult);

    // If approved, update the employee's leaves_taken count
    if (status === 'Approved') {
      const [employeeUpdate] = await db.execute(
        'UPDATE employees_table SET leaves_taken = COALESCE(leaves_taken, 0) + ? WHERE id = ?',
        [request.total_days, request.employee_id]
      );
      console.log('Employee leaves_taken updated:', employeeUpdate);
    }

    res.json({ message: 'Leave request updated successfully' });
  } catch (err) {
    console.error('Error updating leave request:', err);
    res.status(500).json({ 
      error: 'Failed to update request status',
      details: err.message 
    });
  }
});

export default router; 