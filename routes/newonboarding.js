import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js'; // your db connection (should be ESM compatible too)

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/onboarding'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'educationalCertificates', maxCount: 5 },
  { name: 'relievingLetter', maxCount: 1 },
  { name: 'appointmentLetter', maxCount: 1 },
  { name: 'experienceLetter', maxCount: 1 },
  { name: 'paySlips', maxCount: 5 },
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'aadharCard', maxCount: 5 },
  { name: 'panCard', maxCount: 5 },
  { name: 'bankStatement', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      contactNumber,
      maritalStatus,
      designation,
      location,
      pinCode,
      bankAccountNumber,
      ifscCode
    } = req.body;

    const getFilePath = (fieldName) => {
      const files = req.files?.[fieldName];
      if (!files) return null;
      return files.length > 1
        ? JSON.stringify(files.map(file => file.path))
        : files[0].path;
    };

    const resumePath = getFilePath('resume');
    const educationalCertificatesPath = getFilePath('educationalCertificates');
    const relievingLetterPath = getFilePath('relievingLetter');
    const appointmentLetterPath = getFilePath('appointmentLetter');
    const experienceLetterPath = getFilePath('experienceLetter');
    const paySlipsPath = getFilePath('paySlips');
    const passportPhotoPath = getFilePath('passportPhoto');
    const aadharCardPath = getFilePath('aadharCard');
    const panCardPath = getFilePath('panCard');
    const bankStatementPath = getFilePath('bankStatement');

    const insertQuery = `
      INSERT INTO employee_details (
        employee_id, full_name, email, contact_number, marital_status,
        designation, location, pin_code, bank_account_number, ifsc_code,
        resume_path, educational_certificates_path, relieving_letter_path,
        appointment_letter_path, experience_letter_path, pay_slips_path,
        passport_photo_path, aadhar_card_path, pan_card_path, bank_statement_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      employeeId, fullName, email, contactNumber, maritalStatus,
      designation, location, pinCode, bankAccountNumber, ifscCode,
      resumePath, educationalCertificatesPath, relievingLetterPath,
      appointmentLetterPath, experienceLetterPath, paySlipsPath,
      passportPhotoPath, aadharCardPath, panCardPath, bankStatementPath
    ];

    await db.query(insertQuery, values);

    res.status(200).json({ message: 'Onboarding form submitted successfully!' });
  } catch (err) {
    console.error('Error in onboarding:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
