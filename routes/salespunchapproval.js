// routes/salespunch.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all entries
// routes/salespunch.js

// GET all or filtered by employee ID
router.get('/', async (req, res) => {
  const { employeeId } = req.query;

  try {
    let results;
    if (employeeId) {
      [results] = await db.query('SELECT * FROM sales_punches WHERE employee_id = ?', [employeeId]);
    } else {
      [results] = await db.query('SELECT * FROM sales_punches');
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching sales punches:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update approval or remark
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { isapproved, remarks } = req.body;

  try {
    await db.query(
      'UPDATE sales_punches SET isapproved = ?, remarks = ? WHERE id = ?',
      [isapproved, remarks || null, id]
    );
    res.json({ message: 'Sales punch updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
