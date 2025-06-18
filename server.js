import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import db from './db.js'; // <-- Add this if missing

import employeeRoutes from './routes/employees.js';
import applicationRoutes from './routes/applications.js';
import leaveRoutes from './routes/leaves.js';
import attendanceRoutes from './routes/attendance.js';
import messagesRouter from './routes/messages.js';
import tasksRouter from './routes/tasks.js';
import hrLoginRoutes from './routes/hrLogin.js';
import salesPunchRoutes from './routes/salespunch.js';
import directSessionRoutes from './routes/directsessions.js';
import salesPunchApprovalRoutes from './routes/salespunchapproval.js';


// ...

const app = express();
const PORT = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cron.schedule("*/10 * * * *", async () => {
  try {
    await db.query(`
      UPDATE employees_table 
      SET isActive = 0, lastLogout = NOW() 
      WHERE isActive = 1 AND last_active < NOW() - INTERVAL 10 MINUTE
    `);
    console.log("Inactive users cleaned up.");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messagesRouter);
app.use('/api/employees/tasks', tasksRouter);
app.use('/api/hr', hrLoginRoutes);
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
app.use('/api/salespunch', salesPunchRoutes);
app.use('/api/directsession', directSessionRoutes);
app.use('/api/salespunches', salesPunchApprovalRoutes); // ✅ correct route for your fetch
// Add this before your routes
app.use('/uploads/directsession', express.static(path.join(__dirname, 'uploads/directsession')));
app.use('/api/employees/logout', express.raw({ type: 'application/json' }));






app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
