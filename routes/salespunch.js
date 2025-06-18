import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js'; // Adjust the path as per your project

const router = express.Router();

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/salespunch directory exists
const uploadDir = path.join(__dirname, '../uploads/salespunch');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post(
  '/',
  upload.fields([
    { name: 'paymentScreenshot', maxCount: 1 },
    { name: 'documents', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      if (!data.employeeId) {
        return res.status(400).json({ error: 'Employee ID is required.' });
      }

      const paymentScreenshotPath = req.files['paymentScreenshot']
        ? path.join('uploads/salespunch', req.files['paymentScreenshot'][0].filename)
        : null;

      const documentsPath = req.files['documents']
        ? path.join('uploads/salespunch', req.files['documents'][0].filename)
        : null;

      const insertQuery = `
        INSERT INTO sales_punches (
          email, employee_id, name, contact_number, official_email, reporting_manager,
          course_module, course_duration, date_of_sale, customer_registered_number,
          customer_registered_email, total_package_value, scholarship_offered,
          final_course_value, down_payment_amount, payment_mode, payment_screenshot,
          total_emi_amount, monthly_emi, documents, vendor_name, student_name, class,
          school_name, address, time_slot, board
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        data.email || null,
        data.employeeId,
        data.name || null,
        data.contactNumber || null,
        data.officialEmail || null,
        data.reportingManager || null,
        data.courseModule || null,
        data.courseDuration || null,
        data.dateOfSale || null,
        data.customerRegisteredNumber || null,
        data.customerRegisteredEmail || null,
        data.totalPackageValue || null,
        data.scholarshipOffered || null,
        data.finalCourseValue || null,
        data.downPaymentAmount || null,
        data.paymentMode || null,
        paymentScreenshotPath,
        data.totalEmiAmount || null,
        data.monthlyEmi || null,
        documentsPath,
        data.vendorName || null,
        data.studentName || null,
        data.class || null,
        data.schoolName || null,
        data.address || null,
        data.timeSlot || null,
        data.board || null
      ];

      const [result] = await db.query(insertQuery, values);
      res.status(200).json({ message: 'Sales punch data saved successfully.', id: result.insertId });

    } catch (err) {
      console.error('Sales Punch Error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

export default router;
