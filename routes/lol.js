import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.get('/:id', async (req, res) => {
  const employeeId = req.params.id;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM employees_table WHERE id = ?',
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(' Query error:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

export default router;
