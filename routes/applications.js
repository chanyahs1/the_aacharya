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
  const { name, email, jobRole, position } = req.body;
  const resumePath = req.file ? `uploads/resumes/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      `INSERT INTO applications 
      (candidate_name, email, job_role, position, resume_path, status, assign_to, send_to, meet_remarks, meet_link, meet_datetime)
       VALUES (?, ?, ?, ?, ?, 'Pending', NULL, NULL, NULL, NULL, NULL)`,
      [name, email, jobRole, position, resumePath]
    );

    res.status(201).json({
      id: result.insertId,
      candidate_name: name,
      email,
      job_role: jobRole,
      position,
      resume_path: resumePath,
      status: 'Pending'
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

    // Get current history
    const currentHistory = existingApp[0].history || '';
    
    // Create new history entry
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

    // Update the application
    const [result] = await db.execute(
      `UPDATE applications 
       SET status = ?,
           is_approved = ?,
           current_round = ?,
           history = ?,
           round${current_round}_approved_by = ?
       WHERE id = ?`,
      [status, is_approved, current_round, updatedHistory, round_approver, id]
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

export default router; 