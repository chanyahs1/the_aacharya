import express from 'express';
import db from '../db.js';
import { format } from 'date-fns';

const router = express.Router();

// GET all employees with salary info for a selected month
router.get('/', async (req, res) => {
  try {
    const monthParam = req.query.month; // format: 'yyyy-MM'
    let selectedMonth = monthParam ? `${monthParam}-01` : format(new Date(), 'yyyy-MM-01');

    // Get all employees
    const [employees] = await db.query(`
      SELECT e.id as employee_id, e.empID, CONCAT(e.name, ' ', e.surname) as full_name, e.department, e.role, e.salary as base_salary
      FROM employees_table e
    `);

    // Get all salary records for selected month
    const [salaryRows] = await db.query(
      `SELECT * FROM salary WHERE DATE_FORMAT(date_of_payment, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")`,
      [selectedMonth]
    );

    const paidMap = {};
    for (const row of salaryRows) {
      paidMap[row.empID] = row;
    }

    const paid = [];
    const pending = [];

    for (const emp of employees) {
      if (paidMap[emp.empID]) {
        paid.push({ ...emp, ...paidMap[emp.empID] });
      } else {
        pending.push(emp);
      }
    }

    res.json({ pending, paid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch salary data' });
  }
});

// POST to mark salary as paid
router.post('/pay', async (req, res) => {
  const { empID, bonus, total, date_of_payment } = req.body;

  try {
    // Get full employee data
    const [rows] = await db.query(
      'SELECT CONCAT(name, " ", surname) as full_name, department, role, salary FROM employees_table WHERE empID = ?',
      [empID]
    );
    const emp = rows[0];
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    // Check if salary record already exists for this month
    const [existing] = await db.query(
      'SELECT id FROM salary WHERE empID = ? AND DATE_FORMAT(date_of_payment, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")',
      [empID, date_of_payment]
    );

    if (existing.length > 0) {
      // Update salary
      await db.query(
        `UPDATE salary 
         SET full_name = ?, department = ?, role = ?, salary = ?, bonus = ?, total = ?, date_of_payment = ?
         WHERE empID = ? AND DATE_FORMAT(date_of_payment, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")`,
        [
          emp.full_name, emp.department, emp.role, emp.salary,
          bonus, total, date_of_payment,
          empID, date_of_payment
        ]
      );
    } else {
      // Insert salary
      await db.query(
        `INSERT INTO salary 
         (empID, full_name, department, role, salary, bonus, total, date_of_payment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empID, emp.full_name, emp.department, emp.role, emp.salary,
          bonus, total, date_of_payment
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update salary payment' });
  }
});


export default router;
