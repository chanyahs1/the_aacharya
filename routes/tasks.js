import express from 'express';
import pool from '../db.js'; // Adjust path if needed

const router = express.Router();


// ===================== Create a task =====================
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, assigneeId, createdBy } = req.body;

  if (!createdBy) {
    return res.status(400).json({ error: 'createdBy is required' });
  }

  try {
    const [insertResult] = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, assignee_id, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [title, description, dueDate, priority, assigneeId, createdBy]
    );

    const taskId = insertResult.insertId;

    const [taskDetails] = await pool.query(`
      SELECT t.*, 
        e.name AS assignee_name, 
        e.surname AS assignee_surname,
        e.department AS assignee_department,
        e.role AS assignee_role,
        c.name AS creator_name,
        c.surname AS creator_surname
      FROM tasks t
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      LEFT JOIN employees_table c ON t.created_by = c.id
      WHERE t.id = ?
    `, [taskId]);

    res.status(201).json(taskDetails[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating task' });
  }
});

// ===================== Update task status =====================
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined || status === null || status === '') {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const query = `
      UPDATE tasks 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/remarks', async (req, res) => {
  const { id } = req.params;
  const { assignee_remarks } = req.body;

  if (assignee_remarks === undefined || assignee_remarks === null) {
    return res.status(400).json({ error: 'Remarks are required' });
  }

  try {
    const query = `
      UPDATE tasks 
      SET assignee_remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [assignee_remarks, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Remarks updated successfully' });
  } catch (err) {
    console.error('Error updating remarks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// ===================== Delete a task =====================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ?', [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== Get tasks by assignee =====================
router.get('/assignee/:assigneeId', async (req, res) => {
  const { assigneeId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT t.*, 
        e.name AS assignee_name, 
        e.surname AS assignee_surname,
        e.department AS assignee_department,
        e.role AS assignee_role,
        c.name AS creator_name,
        c.surname AS creator_surname
      FROM tasks t
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      LEFT JOIN employees_table c ON t.created_by = c.id
      WHERE t.assignee_id = ?
      ORDER BY t.due_date ASC
    `, [assigneeId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== Get tasks by creator =====================
// Example backend route
router.get('/tasks/creator/:creatorId', async (req, res) => {
  const { creatorId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
              e.name AS assignee_name, 
              e.surname AS assignee_surname, 
              e.role AS assignee_role, 
              e.department AS assignee_department
       FROM tasks t
       JOIN employees e ON t.assignee_id = e.id
       WHERE t.created_by = ?
       ORDER BY t.created_at DESC`,
      [creatorId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
