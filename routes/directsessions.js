import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const router = express.Router();

// __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const uploadDir = path.join(__dirname, '../uploads/directsession');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * POST: Create a new session
 * No selfie should be uploaded in this route
 */
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      class: studentClass,
      board,
      school,
      fatherName,
      contactNumber,
      email,
      address,
      employeeId,
      employeeName,
      sessionDateTime
    } = req.body;

    const insertQuery = `
      INSERT INTO direct_sessions (
        student_name, class, board, school, father_name, contact_number,
        email, address, selfie, employee_id, employee_name, session_datetime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      studentName || null,
      studentClass || null,
      board || null,
      school || null,
      fatherName || null,
      contactNumber || null,
      email || null,
      address || null,
      null, // selfie is null in POST
      employeeId || null,
      employeeName || null, // employeeName should be passed from the frontend
      sessionDateTime || null
    ];

    const [result] = await db.query(insertQuery, values);
    res.status(200).json({ message: 'Direct session submitted successfully.', id: result.insertId });
  } catch (err) {
    console.error('Direct Session Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET: All sessions
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM direct_sessions');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT: Update status
 */
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    await db.query('UPDATE direct_sessions SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT: Update employee's personal remark
 */
router.put('/:id/remark', async (req, res) => {
  const { id } = req.params;
  const { myRemark } = req.body;

  if (!myRemark) return res.status(400).json({ error: 'Remark is required' });

  try {
    await db.query('UPDATE direct_sessions SET my_remarks = ? WHERE id = ?', [myRemark, id]);
    res.json({ message: 'Remark updated successfully' });
  } catch (err) {
    console.error('Error updating remark:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT: Update HOD's remark
 */
router.put('/:id/hodremark', async (req, res) => {
  const { id } = req.params;
  const { hodRemark } = req.body;

  if (!id || !hodRemark) {
    return res.status(400).json({ error: 'Session ID and HOD Remark are required.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE direct_sessions SET hod_remarks = ? WHERE id = ?',
      [hodRemark, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.json({ message: 'Remark updated successfully.' });
  } catch (err) {
    console.error('Error updating HOD remark:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * PUT: Upload or update selfie
 * Accepts multipart/form-data with 'selfie' file
 */
router.put('/:id/selfie', upload.single('selfie'), async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No selfie file uploaded.' });
  }

  const selfiePath = path.join('directsession', req.file.filename);
  let selfieLocation = null;
  if (latitude && longitude) {
    selfieLocation = `${latitude},${longitude}`;
  }

  try {
    const [result] = await db.query(
      'UPDATE direct_sessions SET selfie = ?, selfie_location = ? WHERE id = ?',
      [selfiePath, selfieLocation, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.status(200).json({ message: 'Selfie updated successfully.', updatedSelfie: selfiePath });
  } catch (err) {
    console.error('Error updating selfie:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
