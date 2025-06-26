import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Submit new application
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure resume upload folder exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and Word files are allowed'));
  }
});

router.post('/', upload.single('resume'), async (req, res) => {
  const { name, email, jobRole, position, created_by } = req.body;
  const resumePath = req.file ? `uploads/resumes/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO applications 
      (candidate_name, email, job_role, position, resume_path, status, assign_to, send_to, meet_remarks, meet_link, meet_datetime, created_by)
       VALUES (?, ?, ?, ?, ?, 'Pending', NULL, NULL, NULL, NULL, NULL, ?)`,
      [name, email, jobRole, position, resumePath, created_by]
    );

    res.status(201).json({
      id: result.insertId,
      candidate_name: name,
      email,
      job_role: jobRole,
      position,
      resume_path: resumePath,
      status: 'Pending',
      created_by
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
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
             c.name as creator_name,
             c.surname as creator_surname,
             a.is_approved
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      LEFT JOIN employees_table c ON a.created_by = c.id
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
      round_approver,
      remarks
    } = req.body;

    console.log('Updating application:', {
      id,
      status,
      is_approved,
      current_round,
      round_approver,
      remarks
    });

    // First check if the application exists
    const [existingApp] = await db.execute(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (existingApp.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const currentApp = existingApp[0];

    // Get current history and remarks
    const currentHistory = currentApp.history || '';
    const currentRemarks = currentApp.remarks || '';

    // Create new history entry
    let newHistoryEntry = '';
    if (round_approver) {
      if (status === 'Rejected') {
        newHistoryEntry = `Round rejected by ${round_approver}`;
      } else {
        newHistoryEntry = `Round approved by ${round_approver}`;
      }
    }

    // Combine with existing history and remarks
    const updatedHistory = currentHistory 
      ? `${currentHistory}, ${newHistoryEntry}` 
      : newHistoryEntry;

    const updatedRemarks = remarks
      ? currentRemarks
        ? `${currentRemarks}, ${remarks}`
        : remarks
      : currentRemarks; // If no new remarks sent, keep old ones

    // Update the application
    const [result] = await db.execute(
      `UPDATE applications 
       SET status = ?,
           is_approved = ?,
           current_round = ?,
           history = ?,
           remarks = ?,
           round${current_round}_approved_by = ?
       WHERE id = ?`,
      [status, is_approved, current_round, updatedHistory, updatedRemarks, round_approver, id]
    );

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
              a.remarks,
              a.round1_approved_by,
              a.round2_approved_by,
              a.round3_approved_by,
              a.round4_approved_by,
              a.round5_approved_by,
              a.approved_by_name
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
    // When re-assigning, we change the status to 'assigned'
    await db.execute(
      'UPDATE applications SET is_approved = "assigned", assign_to = ? WHERE id = ?',
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
// Assuming Express route handler
router.put('/:id/meet', async (req, res) => {
  const { id } = req.params;
  const { meet_remarks, meet_datetime, candidate_email } = req.body;

  if (!meet_datetime) {
    return res.status(400).json({ error: 'meet_datetime is required' });
  }

  try {
    const response = await fetch('http://localhost:5000/api/create-interview-meet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie // Pass session cookie for Google auth
      },
      body: JSON.stringify({
        summary: 'Candidate Interview',
        start: meet_datetime,
        attendees: candidate_email ? [{ email: candidate_email }] : []
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Google Meet API error:', data);
      throw new Error(data.error || 'Failed to create Google Meet');
    }

    const meet_link = data.meetLink;

    await db.query(
      `UPDATE applications 
       SET meet_remarks = ?, meet_datetime = ?, meet_link = ? 
       WHERE id = ?`,
      [meet_remarks, meet_datetime, meet_link, id]
    );

    res.status(200).json({ success: true, meet_link });
  } catch (err) {
    console.error('Error in PUT /applications/:id/meet:', err);
    res.status(500).json({ error: 'Failed to update meet info' });
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

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM applications WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;

  try {
    let query;
    let params;

    if (decision === 'select') {
      query = 'UPDATE applications SET is_approved = ? WHERE id = ?';
      params = ['selected', id];
    } else if (decision === 'reject') {
      query = 'UPDATE applications SET status = ? WHERE id = ?';
      params = ['Rejected', id];
    } else {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const [updatedApp] = await db.execute(`
      SELECT a.*, 
             e.name as assignee_name, 
             e.surname as assignee_surname,
             c.name as creator_name,
             c.surname as creator_surname
      FROM applications a
      LEFT JOIN employees_table e ON a.assign_to = e.id
      LEFT JOIN employees_table c ON a.created_by = c.id
      WHERE a.id = ?
    `, [id]);

    res.json(updatedApp[0]);
  } catch (err) {
    console.error('Error handling application decision:', err);
    res.status(500).json({ error: 'Failed to handle application decision' });
  }
});

export default router; 