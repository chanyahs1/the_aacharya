import express from 'express';
import db from '../db.js';

const router = express.Router();

// Add new employee
router.post('/', async (req, res) => {
  const {
    name, surname, empID, email,
    role, department, salary, username, password
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO employees_table 
       (name, surname, empID, email, role, department, salary, username, password, lastLogin, lastLogout, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, true)`,
      [name, surname, empID, email, role, department, salary, username, password]
    );

    res.status(201).json({ id: result.insertId, ...req.body, lastLogin: null, lastLogout: null, isActive: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password, latitude, longitude } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM employees_table WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const employee = rows[0];
    await db.execute(
      'UPDATE employees_table SET lastLogin = NOW(), lastLogout = NULL, isActive = true, loginLatitude = ?, loginLongitude = ? WHERE id = ?',
      [latitude, longitude, employee.id]
    );

    res.json({ ...employee, isActive: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.put('/logout/:id', async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  try {
    await db.execute(
      'UPDATE employees_table SET lastLogout = NOW(), isActive = false, logoutLatitude = ?, logoutLongitude = ? WHERE id = ?',
      [latitude, longitude, id]
    );

    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM employees_table');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks (for HR)
router.get('/tasks', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        e.name as assignee_name,
        e.surname as assignee_surname,
        e.role as assignee_role,
        e.department as assignee_department,
        tr.productivity_rating,
        tr.quality_rating,
        tr.teamwork_rating,
        tr.rated_at
      FROM tasks t 
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      LEFT JOIN task_ratings tr ON t.id = tr.task_id
      ORDER BY t.due_date ASC
    `;
    const [tasks] = await db.query(query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific employee
router.get('/:id/tasks', async (req, res) => {
  try {
    const query = `
      SELECT t.*, e.name as assignee_name, e.surname as assignee_surname, e.role as assignee_role, e.department as assignee_department
      FROM tasks t 
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      WHERE t.assignee_id = ?
      ORDER BY t.due_date ASC
    `;
    const [tasks] = await db.query(query, [req.params.id]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, priority, assigneeId, status = 'Pending' } = req.body;
    const query = `
      INSERT INTO tasks (title, description, due_date, priority, assignee_id, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [title, description, dueDate, priority, assigneeId, status]);
    
    // Fetch the created task with assignee details
    const [newTask] = await db.query(`
      SELECT t.*, e.name as assignee_name, e.surname as assignee_surname, e.role as assignee_role, e.department as assignee_department
      FROM tasks t 
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newTask[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task status
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const query = `
      UPDATE tasks 
      SET status = ?
      WHERE id = ?
    `;
    await db.query(query, [status, req.params.id]);
    
    // Fetch the updated task with assignee details
    const [updatedTask] = await db.query(`
      SELECT t.*, e.name as assignee_name, e.surname as assignee_surname, e.role as assignee_role, e.department as assignee_department
      FROM tasks t 
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (updatedTask.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updatedTask[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit task ratings
router.post('/tasks/:id/rating', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { employeeId, ratings } = req.body;

    // First check if the task has already been rated
    const [existingRating] = await db.query(
      'SELECT id FROM task_ratings WHERE task_id = ?',
      [taskId]
    );

    if (existingRating.length > 0) {
      return res.status(400).json({ error: 'Task has already been rated' });
    }

    // Insert the ratings
    const query = `
      INSERT INTO task_ratings (
        task_id,
        employee_id,
        productivity_rating,
        quality_rating,
        teamwork_rating
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      taskId,
      employeeId,
      ratings.productivity,
      ratings.quality,
      ratings.teamwork
    ]);

    res.status(201).json({ message: 'Ratings submitted successfully' });
  } catch (error) {
    console.error('Error submitting ratings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const query = 'DELETE FROM tasks WHERE id = ?';
    const [result] = await db.query(query, [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee performance data
router.get('/performance', async (req, res) => {
  try {
    // Get individual performance metrics
    const query = `
      SELECT 
        e.id,
        e.name,
        e.surname,
        e.role,
        e.department,
        ROUND(AVG(tr.productivity_rating)*10 , 1) as avg_productivity,
        ROUND(AVG(tr.quality_rating)*10 , 1) as avg_quality,
        ROUND(AVG(tr.teamwork_rating)*10 , 1) as avg_teamwork,
        COUNT(tr.id) as total_tasks,
        MAX(tr.rated_at) as last_rated
      FROM employees_table e
      LEFT JOIN task_ratings tr ON e.id = tr.employee_id
      GROUP BY e.id, e.name, e.surname, e.role
      HAVING total_tasks > 0
    `;

    const [employeeMetrics] = await db.query(query);

    // Calculate overall team performance
    const teamQuery = `
      SELECT 
        ROUND(AVG(productivity_rating) * 10, 1) as team_productivity,
        ROUND(AVG(quality_rating) * 10, 1) as team_quality,
        ROUND(AVG(teamwork_rating) * 10, 1) as team_teamwork
      FROM task_ratings
      WHERE rated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
    `;

    const [teamMetrics] = await db.query(teamQuery);

    // Calculate previous month's metrics for comparison
    const previousMonthQuery = `
      SELECT 
        ROUND(AVG(productivity_rating) * 10, 1) as prev_productivity,
        ROUND(AVG(quality_rating) * 10, 1) as prev_quality,
        ROUND(AVG(teamwork_rating) * 10, 1) as prev_teamwork
      FROM task_ratings
      WHERE rated_at BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) 
        AND DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
    `;

    const [previousMetrics] = await db.query(previousMonthQuery);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (!previous) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const teamPerformance = {
      current: {
        productivity: teamMetrics[0].team_productivity || 0,
        quality: teamMetrics[0].team_quality || 0,
        teamwork: teamMetrics[0].team_teamwork || 0
      },
      changes: {
        productivity: calculateChange(
          teamMetrics[0].team_productivity,
          previousMetrics[0].prev_productivity
        ),
        quality: calculateChange(
          teamMetrics[0].team_quality,
          previousMetrics[0].prev_quality
        ),
        teamwork: calculateChange(
          teamMetrics[0].team_teamwork,
          previousMetrics[0].prev_teamwork
        )
      }
    };

    res.json({
      teamPerformance,
      employeeMetrics: employeeMetrics.map(emp => ({
  id: emp.id,
  name: emp.name,
  surname: emp.surname,
  role: emp.role,
  department: emp.department,
  metrics: {
    productivity: emp.avg_productivity ?? 0,
    quality: emp.avg_quality ?? 0,
    teamwork: emp.avg_teamwork ?? 0
  },
  totalTasks: emp.total_tasks,
  lastRated: emp.last_rated,
  status: calculateStatus(
    emp.avg_productivity ?? 0,
    emp.avg_quality ?? 0,
    emp.avg_teamwork ?? 0
  )
}))
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate performance status
function calculateStatus(productivity = 0, quality = 0, teamwork = 0) {
  const average =
    (Number(productivity) + Number(quality) + Number(teamwork)) / 3;
  if (average >= 90) {
    return 'Outstanding';
  } else if (average >= 80) {
    return 'Excellent';
  } else if (average >= 70) {
    return 'Very Good';
  }
  else if (average >= 60) {
    return 'Good';
  }
  else if (average >= 50) {
    return 'Average';
  }
  return `Needs Improvement`;
}




// Get calendar events
router.get('/calendar-events', async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = `
      SELECT 
        ce.*,
        e.name as creator_name,
        e.surname as creator_surname,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', ea.employee_id,
            'status', ea.status,
            'name', emp.name,
            'surname', emp.surname
          )
        ) as attendees
      FROM calendar_events ce
      LEFT JOIN employees_table e ON ce.created_by = e.id
      LEFT JOIN event_attendees ea ON ce.id = ea.event_id
      LEFT JOIN employees_table emp ON ea.employee_id = emp.id
      WHERE MONTH(ce.start_time) = ? AND YEAR(ce.start_time) = ?
      GROUP BY ce.id
      ORDER BY ce.start_time ASC
    `;
    
    const [events] = await db.query(query, [month, year]);
    
    // Parse attendees string into array
    const formattedEvents = events.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(`[${event.attendees}]`) : []
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create calendar event
router.post('/calendar-events', async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      eventType,
      createdBy,
      attendees
    } = req.body;

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Insert event
      const [eventResult] = await db.query(
        `INSERT INTO calendar_events (
          title, description, start_time, end_time, event_type, created_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, new Date(startTime), new Date(endTime), eventType, createdBy]
      );

      // Insert attendees if any
      if (attendees && attendees.length > 0) {
        const values = attendees.map(id => `(${eventResult.insertId}, ${parseInt(id)})`).join(',');
        await db.query(
          `INSERT INTO event_attendees (event_id, employee_id) VALUES ${values}`
        );

        // Create notifications for all attendees
        const notificationValues = attendees.map(id => 
          `(${parseInt(id)}, 'Link: ${title}', '${description}', 'event', ${eventResult.insertId}, NOW(), false)`
        ).join(',');

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read) 
           VALUES ${notificationValues}`
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      // Fetch the created event with attendees
      const [newEvent] = await db.query(
        `SELECT 
          ce.*,
          e.name as creator_name,
          e.surname as creator_surname,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', ea.employee_id,
              'status', ea.status,
              'name', emp.name,
              'surname', emp.surname
            )
          ) as attendees
        FROM calendar_events ce
        LEFT JOIN employees_table e ON ce.created_by = e.id
        LEFT JOIN event_attendees ea ON ce.id = ea.event_id
        LEFT JOIN employees_table emp ON ea.employee_id = emp.id
        WHERE ce.id = ?
        GROUP BY ce.id`,
        [eventResult.insertId]
      );

      res.status(201).json({
        ...newEvent[0],
        attendees: newEvent[0].attendees ? JSON.parse(`[${newEvent[0].attendees}]`) : []
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event attendance status
router.patch('/calendar-events/:eventId/attendance', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { employeeId, status } = req.body;

    await db.query(
      `UPDATE event_attendees 
       SET status = ?
       WHERE event_id = ? AND employee_id = ?`,
      [status, eventId, employeeId]
    );

    res.json({ message: 'Attendance status updated successfully' });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
router.put('/calendar-events/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      eventType,
      attendees
    } = req.body;

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Update event
      await db.query(
        `UPDATE calendar_events 
         SET title = ?, description = ?, start_time = ?, end_time = ?, event_type = ?
         WHERE id = ?`,
        [title, description, new Date(startTime), new Date(endTime), eventType, req.params.id]
      );

      // Delete existing attendees
      await db.query('DELETE FROM event_attendees WHERE event_id = ?', [req.params.id]);

      // Insert new attendees
      if (attendees && attendees.length > 0) {
        const values = attendees.map(id => `(${req.params.id}, ${parseInt(id)})`).join(',');
        await db.query(
          `INSERT INTO event_attendees (event_id, employee_id) VALUES ${values}`
        );

        // Create notifications for new attendees
        const notificationValues = attendees.map(id => 
          `(${parseInt(id)}, 'Link : ${title}', 'The event has been updated :${description}', 'event', ${req.params.id}, NOW(), false)`
        ).join(',');

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read) 
           VALUES ${notificationValues}`
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      // Fetch the updated event
      const [updatedEvent] = await db.query(
        `SELECT 
          ce.*,
          e.name as creator_name,
          e.surname as creator_surname,
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', ea.employee_id,
              'status', ea.status,
              'name', emp.name,
              'surname', emp.surname
            )
          ) as attendees
        FROM calendar_events ce
        LEFT JOIN employees_table e ON ce.created_by = e.id
        LEFT JOIN event_attendees ea ON ce.id = ea.event_id
        LEFT JOIN employees_table emp ON ea.employee_id = emp.id
        WHERE ce.id = ?
        GROUP BY ce.id`,
        [req.params.id]
      );

      res.json({
        ...updatedEvent[0],
        attendees: updatedEvent[0].attendees ? JSON.parse(`[${updatedEvent[0].attendees}]`) : []
      });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete calendar event
router.delete('/calendar-events/:id', async (req, res) => {
  try {
    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Get event details and attendees before deletion
      const [event] = await db.query(
        `SELECT ce.*, GROUP_CONCAT(ea.employee_id) as attendee_ids
         FROM calendar_events ce
         LEFT JOIN event_attendees ea ON ce.id = ea.event_id
         WHERE ce.id = ?
         GROUP BY ce.id`,
        [req.params.id]
      );

      if (!event[0]) {
        throw new Error('Event not found');
      }

      // Create cancellation notifications for attendees
      if (event[0].attendee_ids) {
        const attendeeIds = event[0].attendee_ids.split(',');
        const notificationValues = attendeeIds.map(id => 
          `(${parseInt(id)}, 'Event Cancelled', 'The event has been cancelled', 'event', ${req.params.id}, NOW(), false)`
        ).join(',');

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read) 
           VALUES ${notificationValues}`
        );
      }

      // First delete all attendees
      await db.query('DELETE FROM event_attendees WHERE event_id = ?', [req.params.id]);

      // Then delete the event
      await db.query('DELETE FROM calendar_events WHERE id = ?', [req.params.id]);

      // Commit transaction
      await db.query('COMMIT');

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get notifications for an employee
router.get('/:id/notifications', async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE employee_id = ? 
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
