import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get login/logout records for a specific employee on a specific date
router.get('/:empID/logs/:date', async (req, res) => {
    try {
        const { empID, date } = req.params;

        // The date will be in 'YYYY-MM-DD' format from the frontend
        const query = `
      SELECT login_time, logout_time, login_location, logout_location 
      FROM login_logs 
      WHERE empID = ? AND DATE(login_time) = ?
      ORDER BY login_time ASC
    `;

        const [logs] = await db.query(query, [empID, date]);

        if (logs.length === 0) {
          return res.status(404).json({ message: 'No records found for this day.' });
        }

        res.json(logs);

    } catch (err) {
        console.error("Error fetching login logs:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router; 