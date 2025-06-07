import express from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employees.js';
import applicationRoutes from './routes/applications.js';
import leaveRoutes from './routes/leaves.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/leaves', leaveRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
