import express from 'express';
import db from '../db.js';

const router = express.Router();

// Submit new application
router.post('/', async (req, res) => {
  const { name, jobRole } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO applications (candidate_name, job_role) 
       VALUES (?, ?)`,
      [name, jobRole]
    );

    res.status(201).json({ 
      id: result.insertId,
      candidate_name: name,
      job_role: jobRole,
      status: 'Pending',
      assign_to: null,
      send_to: null,
      meet_remarks: null,
      meet_link: null,
      meet_datetime: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all applications...');
    
    const [rows] = await db.execute(`
      SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             e.role as assignee_role,
             e.email as assignee_email,
             a.is_approved
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      ORDER BY a.created_at DESC
    `);

    console.log(`Found ${rows.length} applications`);
    res.json(rows);
  } catch (err) {
    console.error('Error in GET /applications:', err);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      details: err.message 
    });
  }
});

// Update application status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      is_approved,
      current_round,
      round_approver
    } = req.body;

    console.log('Updating application:', {
      id,
      status,
      is_approved,
      current_round,
      round_approver
    });

    // First check if the application exists
    const [existingApp] = await db.execute(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (existingApp.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if trying to approve/reject in round 2 or higher without round 1 approval
    if (current_round > 1 && !existingApp[0].round1_approved_by) {
      return res.status(400).json({ 
        error: 'Cannot proceed to round ' + current_round + ' without round 1 approval' 
      });
    }

    // Get current history
    const currentHistory = existingApp[0].history || '';
    
    // Create new history entry without round number
    let newHistoryEntry = '';
    if (round_approver) {
      if (status === 'Rejected') {
        newHistoryEntry = `Round rejected by ${round_approver}`;
      } else {
        newHistoryEntry = `Round approved by ${round_approver}`;
      }
    }

    // Combine with existing history
    const updatedHistory = currentHistory 
      ? `${currentHistory}, ${newHistoryEntry}`
      : newHistoryEntry;

    // Prepare the update query based on the current round
    let updateQuery = 'UPDATE applications SET status = ?, is_approved = ?, current_round = ?, history = ?';
    let updateParams = [status, is_approved, current_round, updatedHistory];

    // Add the appropriate round approver column
    if (round_approver) {
      updateQuery += `, round${current_round}_approved_by = ?`;
      updateParams.push(round_approver);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    // Update the application
    const [result] = await db.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Get the updated application
    const [updatedApp] = await db.execute(
      `SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             e.role as assignee_role,
             e.email as assignee_email,
             a.is_approved,
             a.current_round,
             a.history,
             a.round1_approved_by,
             a.round2_approved_by,
             a.round3_approved_by,
             a.round4_approved_by,
             a.round5_approved_by
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      WHERE a.id = ?`,
      [id]
    );

    console.log('Updated application:', updatedApp[0]);

    res.json(updatedApp[0]);
  } catch (err) {
    console.error('Error updating application:', err);
    res.status(500).json({ 
      error: 'Failed to update application',
      details: err.message 
    });
  }
});

// Update application assignment
router.put('/:id/assign', async (req, res) => {
  const { assign_to } = req.body;
  
  try {
    await db.execute(
      'UPDATE applications SET assign_to = ? WHERE id = ?',
      [assign_to, req.params.id]
    );

    const [rows] = await db.execute(`
      SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             e.role as assignee_role,
             e.email as assignee_email
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      WHERE a.id = ?
    `, [req.params.id]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update meet information
router.put('/:id/meet', async (req, res) => {
  const { meet_remarks, meet_link, meet_datetime } = req.body;
  
  try {
    await db.execute(
      'UPDATE applications SET meet_remarks = ?, meet_link = ?, meet_datetime = ? WHERE id = ?',
      [meet_remarks, meet_link, meet_datetime, req.params.id]
    );

    const [rows] = await db.execute(`
      SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             e.role as assignee_role,
             e.email as assignee_email
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      WHERE a.id = ?
    `, [req.params.id]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update send to email
router.put('/:id/send', async (req, res) => {
  const { send_to, employee_name } = req.body;
  
  try {
    const sendToData = JSON.stringify({
      name: employee_name,
      email: send_to
    });

    await db.execute(
      'UPDATE applications SET send_to = ? WHERE id = ?',
      [sendToData, req.params.id]
    );

    const [rows] = await db.execute(`
      SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             e.role as assignee_role,
             e.email as assignee_email
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      WHERE a.id = ?
    `, [req.params.id]);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 