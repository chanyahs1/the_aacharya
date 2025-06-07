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

// Get employee's leave balance
router.get('/balance/:employeeId', async (req, res) => {
  try {
    const [balances] = await db.execute(`
      SELECT lb.*, lt.name as leave_type_name, lt.max_days
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = ? AND lb.year = YEAR(CURRENT_DATE)
    `, [req.params.employeeId]);
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create leave request
router.post('/request', async (req, res) => {
  const {
    employee_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    reason
  } = req.body;

  try {
    // Check if employee exists
    const [employee] = await db.execute(`
      SELECT empID FROM employees_table WHERE empID = ?
    `, [employee_id]);

    if (!employee.length) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check leave balance
    const [balance] = await db.execute(`
      SELECT * FROM leave_balances 
      WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(CURRENT_DATE)
    `, [employee_id, leave_type_id]);

    if (!balance.length || balance[0].used_days + total_days > balance[0].total_days) {
      return res.status(400).json({ error: 'Insufficient leave balance' });
    }

    // Create leave request
    const [result] = await db.execute(`
      INSERT INTO leave_requests 
      (employee_id, leave_type_id, start_date, end_date, total_days, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, leave_type_id, start_date, end_date, total_days, reason]);

    res.status(201).json({ id: result.insertId, ...req.body, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get employee's leave requests
router.get('/requests/:employeeId', async (req, res) => {
  try {
    const [requests] = await db.execute(`
      SELECT lr.*, lt.name as leave_type_name,
             e.name as employee_name, e.surname as employee_surname,
             a.name as approver_name, a.surname as approver_surname
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN employees_table e ON lr.employee_id = e.empID
      LEFT JOIN employees_table a ON lr.approved_by = a.empID
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `, [req.params.employeeId]);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pending leave requests (for HR)
router.get('/pending', async (req, res) => {
  try {
    const [requests] = await db.execute(`
      SELECT lr.*, lt.name as leave_type_name,
             e.name as employee_name, e.surname as employee_surname,
             e.role as employee_role
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN employees_table e ON lr.employee_id = e.empID
      WHERE lr.status = 'Pending'
      ORDER BY lr.created_at DESC
    `);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update leave request status
router.patch('/request/:id', async (req, res) => {
  const { status, approved_by } = req.body;

  try {
    await db.query('START TRANSACTION');

    try {
      // Update leave request
      await db.execute(`
        UPDATE leave_requests 
        SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, approved_by, req.params.id]);

      // If approved, update leave balance
      if (status === 'Approved') {
        const [request] = await db.execute(`
          SELECT employee_id, leave_type_id, total_days 
          FROM leave_requests 
          WHERE id = ?
        `, [req.params.id]);

        await db.execute(`
          UPDATE leave_balances 
          SET used_days = used_days + ?
          WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(CURRENT_DATE)
        `, [request[0].total_days, request[0].employee_id, request[0].leave_type_id]);
      }

      await db.query('COMMIT');
      res.json({ message: 'Leave request updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 