import express from "express";
import db from "../db.js";
import multer from "multer";
import pool from "../db.js"; // adjust path if needed
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/auth.js"; // adjust path if needed
import path from "path";

const router = express.Router();

const onboardingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/onboarding/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const onboardingUpload = multer({ storage: onboardingStorage });

const documentFields = [
  { name: "resume_path", maxCount: 1 },
  { name: "educational_certificates_path", maxCount: 1 },
  { name: "relieving_letter_path", maxCount: 1 },
  { name: "appointment_letter_path", maxCount: 1 },
  { name: "experience_letter_path", maxCount: 1 },
  { name: "pay_slips_path", maxCount: 1 },
  { name: "passport_photo_path", maxCount: 1 },
  { name: "aadhar_card_path", maxCount: 1 },
  { name: "pan_card_path", maxCount: 1 },
  { name: "bank_statement_path", maxCount: 1 },
];

// Add new employee
dotenv.config();

router.post("/login", async (req, res) => {
  const { username, password, latitude, longitude } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM employees_table WHERE username = ?",
      [username]
    );
    const user = rows[0];

    if (!user || user.password !== password || user.is_disable == 1) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.department === "HR") {
      return res.status(403).json({ message: "Login as an HR" }); // 403 Forbidden
    }

    const payload = {
      empID: user.empID,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      state: user.state,
      district: user.district,
      lastLogin: user.lastLogin,
      lastLogout: user.lastLogout,
      loginLatitude: user.loginLatitude,
      loginLongitude: user.loginLongitude,
      logoutLatitude: user.logoutLatitude,
      logoutLongitude: user.logoutLongitude,
      department: user.department,
      id: user.id,
      role: user.role,
      isActive: user.isActive,
      leaves_taken: user.leaves_taken,
      assigned_supervisor: user.assigned_supervisor,
      district: user.district,
      state: user.state,
      my_assignees: user.my_assignees,
      last_active: user.last_active,
      onboarded: user.onboarded,
      gender: user.gender,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    await db.query(
      `UPDATE employees_table SET isActive = 1, last_active = NOW(), lastLogin = NOW(), loginLatitude = ?, loginLongitude = ? WHERE empID = ?`,
      [latitude, longitude, user.empID]
    );
    await db.query(
      `
  INSERT INTO login_logs (empID, login_time, login_location)
  VALUES (?, NOW(), ?)
`,
      [user.empID, `${latitude}, ${longitude}`]
    );

    // ✅ This is the correct response shape:
    res.json({
      token,
      employee: {
        empID: user.empID,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        state: user.state,
        district: user.district,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        loginLatitude: user.loginLatitude,
        loginLongitude: user.loginLongitude,
        logoutLatitude: user.logoutLatitude,
        logoutLongitude: user.logoutLongitude,
        department: user.department,
        id: user.id,
        role: user.role,
        isActive: user.isActive,
        leaves_taken: user.leaves_taken,
        assigned_supervisor: user.assigned_supervisor,
        district: user.district,
        state: user.state,
        my_assignees: user.my_assignees,
        last_active: user.last_active,
        onboarded: user.onboarded,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    surname,
    empID,
    email,
    role,
    department,
    salary,
    username,
    password,
    state,
    district,
    lastLogin,
    lastLogout,
    loginLatitude,
    loginLongitude,
    logoutLatitude,
    logoutLongitude,
    gender,
    personal_email,
  } = req.body;

  try {
    await db.query(
      `INSERT INTO employees_table 
      (name, surname, empID, email, role, department, salary, username, password, state, district, lastLogin, lastLogout, loginLatitude,
    loginLongitude,
    logoutLatitude,
    logoutLongitude,gender, personal_email) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)`,
      [
        name,
        surname,
        empID,
        email,
        role,
        department,
        salary,
        username,
        password,
        state,
        district,
        lastLogin,
        lastLogout,
        loginLatitude,
        loginLongitude,
        logoutLatitude,
        logoutLongitude,
        gender,
        personal_email,
      ]
    );

    res.json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-activity", async (req, res) => {
  const { empID } = req.body;
  if (!empID) return res.status(400).json({ error: "empID required" });

  try {
    await db.query(
      `
      UPDATE employees_table 
      SET last_active = NOW(), isActive = 1 
      WHERE empID = ?
    `,
      [empID]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Heartbeat update error:", err);
    res.sendStatus(500);
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  const { empID } = req.body;
  if (!empID) return res.status(400).json({ error: "empID required" });

  try {
    await db.query(
      `
      UPDATE employees_table 
      SET lastLogout = NOW(), isActive = 0 
      WHERE empID = ?
    `,
      [empID]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Logout error:", err);
    res.sendStatus(500);
  }
});

// Logout
router.put("/logout/:id", async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  try {
    // 1. Get empID using id from employees_table
    const [rows] = await db.query(
      "SELECT empID FROM employees_table WHERE id = ?",
      [id]
    );
    const emp = rows[0];
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const empID = emp.empID;

    // 2. Update employees_table
    await db.execute(
      "UPDATE employees_table SET lastLogout = NOW(), isActive = false, logoutLatitude = ?, logoutLongitude = ? WHERE id = ?",
      [latitude, longitude, id]
    );

    // 3. Update the latest login_logs row for this empID where logout_time is NULL
    await db.query(
      `
      UPDATE login_logs 
      SET logout_time = NOW(), logout_location = ? 
      WHERE empID = ? AND logout_time IS NULL 
      ORDER BY id DESC LIMIT 1
    `,
      [`${latitude}, ${longitude}`, empID]
    );

    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all employees
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM employees_table");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get all tasks (for HR)
router.get("/hr/tasks", async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        -- Assignee Info
        e.name AS assignee_name,
        e.surname AS assignee_surname,
        e.role AS assignee_role,
        e.empID AS assignee_empID,
        e.department AS assignee_department,

        -- Creator Info
        c.name AS creator_name,
        c.surname AS creator_surname,
        c.role AS creator_role,
        c.department AS creator_department,

        -- Rating Info
        tr.productivity_rating,
        tr.quality_rating,
        tr.teamwork_rating,
        tr.rated_at

      FROM tasks t
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      LEFT JOIN employees_table c ON t.created_by = c.id
      LEFT JOIN task_ratings tr ON t.id = tr.task_id
      ORDER BY t.due_date ASC
    `;

    const [tasks] = await db.query(query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get tasks for a specific employee
router.get("/:id/tasks", async (req, res) => {
  try {
    const query = `
      SELECT t.*, e.name as assignee_name, e.surname as assignee_surname, e.role as assignee_role, e.department as assignee_department, e.empID as assignee_empID
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

// Submit task ratings
router.post("/tasks/:id/rating", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { employeeId, ratings } = req.body;

    // First check if the task has already been rated
    const [existingRating] = await db.query(
      "SELECT id FROM task_ratings WHERE task_id = ?",
      [taskId]
    );

    if (existingRating.length > 0) {
      return res.status(400).json({ error: "Task has already been rated" });
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
      ratings.teamwork,
    ]);

    res.status(201).json({ message: "Ratings submitted successfully" });
  } catch (error) {
    console.error("Error submitting ratings:", error);
    res.status(500).json({ error: error.message });
  }
});
// Get employee performance data
router.get("/performance", async (req, res) => {
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
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    const teamPerformance = {
      current: {
        productivity: teamMetrics[0].team_productivity || 0,
        quality: teamMetrics[0].team_quality || 0,
        teamwork: teamMetrics[0].team_teamwork || 0,
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
        ),
      },
    };

    res.json({
      teamPerformance,
      employeeMetrics: employeeMetrics.map((emp) => ({
        id: emp.id,
        name: emp.name,
        surname: emp.surname,
        role: emp.role,
        department: emp.department,
        metrics: {
          productivity: emp.avg_productivity ?? 0,
          quality: emp.avg_quality ?? 0,
          teamwork: emp.avg_teamwork ?? 0,
        },
        totalTasks: emp.total_tasks,
        lastRated: emp.last_rated,
        status: calculateStatus(
          emp.avg_productivity ?? 0,
          emp.avg_quality ?? 0,
          emp.avg_teamwork ?? 0
        ),
      })),
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate performance status
function calculateStatus(productivity = 0, quality = 0, teamwork = 0) {
  const average =
    (Number(productivity) + Number(quality) + Number(teamwork)) / 3;
  if (average >= 90) {
    return "Outstanding";
  } else if (average >= 80) {
    return "Excellent";
  } else if (average >= 70) {
    return "Very Good";
  } else if (average >= 60) {
    return "Good";
  } else if (average >= 50) {
    return "Average";
  }
  return `Needs Improvement`;
}

// Get calendar events
router.get("/calendar-events", async (req, res) => {
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
    const formattedEvents = events.map((event) => ({
      ...event,
      attendees: event.attendees ? JSON.parse(`[${event.attendees}]`) : [],
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create calendar event
router.post("/calendar-events", async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      eventType,
      createdBy,
      attendees,
      meet_link,
    } = req.body;

    await db.query("START TRANSACTION");

    try {
      const [eventResult] = await db.query(
        `INSERT INTO calendar_events (
          title, description, start_time, end_time, event_type, created_by, meet_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, new Date(startTime), new Date(endTime), eventType, createdBy, meet_link]
      );

      const eventId = eventResult.insertId;

      if (attendees?.length > 0) {
        const attendeeValues = attendees.map(id => `(${eventId}, ${parseInt(id)})`).join(",");
        await db.query(
          `INSERT INTO event_attendees (event_id, employee_id) VALUES ${attendeeValues}`
        );

        const notificationValues = attendees.map(id =>
          `(${parseInt(id)}, ?, ?, 'event', ${eventId}, NOW(), false)`
        );

        const flattened = attendees.flatMap(() => [
          `You have been invited to: ${title}`,
          description,
        ]);

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read) 
           VALUES ${notificationValues.join(",")}`,
          flattened
        );
      }

      await db.query("COMMIT");

      const [newEvent] = await db.query(
        `SELECT 
          ce.*, e.name AS creator_name, e.surname AS creator_surname,
          GROUP_CONCAT(
            JSON_OBJECT('id', ea.employee_id, 'status', ea.status, 'name', emp.name, 'surname', emp.surname)
          ) AS attendees
        FROM calendar_events ce
        LEFT JOIN employees_table e ON ce.created_by = e.id
        LEFT JOIN event_attendees ea ON ce.id = ea.event_id
        LEFT JOIN employees_table emp ON ea.employee_id = emp.id
        WHERE ce.id = ?
        GROUP BY ce.id`,
        [eventId]
      );

      res.status(201).json({
        ...newEvent[0],
        attendees: newEvent[0].attendees ? JSON.parse(`[${newEvent[0].attendees}]`) : [],
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({ error: error.message });
  }
});


// Update event attendance status
router.patch("/calendar-events/:eventId/attendance", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { employeeId, status } = req.body;

    await db.query(
      `UPDATE event_attendees 
       SET status = ?
       WHERE event_id = ? AND employee_id = ?`,
      [status, eventId, employeeId]
    );

    res.json({ message: "Attendance status updated successfully" });
  } catch (error) {
    console.error("Error updating attendance status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
router.put("/calendar-events/:id", async (req, res) => {
  try {
    const { title, description, startTime, endTime, eventType, attendees } = req.body;
    const eventId = req.params.id;

    await db.query("START TRANSACTION");

    try {
      await db.query(
        `UPDATE calendar_events 
         SET title = ?, description = ?, start_time = ?, end_time = ?, event_type = ?
         WHERE id = ?`,
        [title, description, new Date(startTime), new Date(endTime), eventType, eventId]
      );

      await db.query("DELETE FROM event_attendees WHERE event_id = ?", [eventId]);

      if (attendees?.length > 0) {
        const attendeeValues = attendees.map(id => `(${eventId}, ${parseInt(id)})`).join(",");
        await db.query(
          `INSERT INTO event_attendees (event_id, employee_id) VALUES ${attendeeValues}`
        );

        const notificationValues = attendees.map(id =>
          `(${parseInt(id)}, ?, ?, 'event', ${eventId}, NOW(), false)`
        );

        const flattened = attendees.flatMap(() => [
          `Event Updated: ${title}`,
          description,
        ]);

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read)
           VALUES ${notificationValues.join(",")}`,
          flattened
        );
      }

      await db.query("COMMIT");

      const [updatedEvent] = await db.query(
        `SELECT 
          ce.*, e.name AS creator_name, e.surname AS creator_surname,
          GROUP_CONCAT(
            JSON_OBJECT('id', ea.employee_id, 'status', ea.status, 'name', emp.name, 'surname', emp.surname)
          ) AS attendees
        FROM calendar_events ce
        LEFT JOIN employees_table e ON ce.created_by = e.id
        LEFT JOIN event_attendees ea ON ce.id = ea.event_id
        LEFT JOIN employees_table emp ON ea.employee_id = emp.id
        WHERE ce.id = ?
        GROUP BY ce.id`,
        [eventId]
      );

      res.json({
        ...updatedEvent[0],
        attendees: updatedEvent[0].attendees ? JSON.parse(`[${updatedEvent[0].attendees}]`) : [],
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating calendar event:", error);
    res.status(500).json({ error: error.message });
  }
});


// Delete calendar event
router.delete("/calendar-events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    await db.query("START TRANSACTION");

    try {
      const [event] = await db.query(
        `SELECT ce.*, GROUP_CONCAT(ea.employee_id) AS attendee_ids
         FROM calendar_events ce
         LEFT JOIN event_attendees ea ON ce.id = ea.event_id
         WHERE ce.id = ?
         GROUP BY ce.id`,
        [eventId]
      );

      if (!event[0]) throw new Error("Event not found");

      const { title, description } = event[0];
      const attendeeIds = event[0].attendee_ids ? event[0].attendee_ids.split(",") : [];

      if (attendeeIds.length > 0) {
        const notificationValues = attendeeIds.map(id =>
          `(${parseInt(id)}, ?, ?, 'event', ${eventId}, NOW(), false)`
        );

        const flattened = attendeeIds.flatMap(() => [
          `Event Cancelled: ${title}`,
          description,
        ]);

        await db.query(
          `INSERT INTO notifications 
           (employee_id, title, message, type, reference_id, created_at, is_read) 
           VALUES ${notificationValues.join(",")}`,
          flattened
        );
      }

      await db.query("DELETE FROM event_attendees WHERE event_id = ?", [eventId]);
      await db.query("DELETE FROM calendar_events WHERE id = ?", [eventId]);

      await db.query("COMMIT");

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get notifications for an employee
router.get("/:id/notifications", async (req, res) => {
  try {
    const [notifications] = await db.query(
      `
      SELECT 
        n.*, 
        ce.title AS event_title,
        ce.description AS event_description, 
        ce.start_time, 
        ce.end_time,
        ce.meet_link
      FROM notifications n
      LEFT JOIN calendar_events ce ON n.type = 'event' AND n.reference_id = ce.id
      WHERE n.employee_id = ?
      ORDER BY n.created_at DESC
      `,
      [req.params.id]
    );

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch("/notifications/:id", async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = true WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single employee by id
router.get("/details/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        d.full_name,
        d.email,
        d.contact_number,
        d.marital_status,
        d.designation,
        d.location,
        d.pin_code,
        d.bank_account_number,
        d.ifsc_code,
        d.resume_path,
        d.educational_certificates_path,
        d.relieving_letter_path,
        d.appointment_letter_path,
        d.experience_letter_path,
        d.pay_slips_path,
        d.passport_photo_path,
        d.aadhar_card_path,
        d.pan_card_path,
        d.bank_statement_path,
        e.role,
        e.department,
        e.email,
        e.personal_email,
        e.empID,
        e.salary,
        e.state,
        e.district,
        e.leaves_taken,
        e.username,
        e.password,
        e.gender
      FROM employee_details d
      JOIN employees_table e ON d.employee_id = e.id
      WHERE d.employee_id = ?
      `,
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching employee details:", err);
    res.status(500).json({ error: err.message });
  }
});

// Place this near the top, before any /:id routes!
router.get("/department/:department", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, surname, email, role, department, empID, salary, lastLogin, loginLatitude, loginLongitude, isActive, district, state
       FROM employees_table 
       WHERE department = ?`,
      [req.params.department]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching department employees:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/department-messages/:department", async (req, res) => {
  const { department } = req.params;

  try {
    let query = `
      SELECT id, name, surname, email, role, department, empID, salary, lastLogin, loginLatitude, loginLongitude, isActive, district, state
      FROM employees_table
    `;
    let values = [];

    if (department === "HR") {
      // No WHERE clause: fetch all departments
    } else {
      // Fetch current department + HR
      query += ` WHERE department = ? OR department = 'HR'`;
      values = [department];
    }

    const [rows] = await db.execute(query, values);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching department employees:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    "name",
    "surname",
    "email",
    "personal_email",
    "role",
    "department",
    "lastLogout",
    "state",
    "district",
    "gender",
    "salary",
    "username",
    "password",
    "is_disable",
  ];
  const updates = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields to update." });
  }

  values.push(id);

  try {
    const [result] = await db.execute(
      `UPDATE employees_table SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get employees by hierarchy/role

// Role hierarchy (highest to lowest)
const roleHierarchy = [
  "Head of Department",
  "Area General Manager",
  "Senior Manager",
  "Manager",
  "Executive",
  "Associate",
  "Intern",
  "Trainee",
];

router.get("/hierarchy/:role", async (req, res) => {
  const currentRole = req.params.role;
  const department = req.query.department;

  const currentRoleIndex = roleHierarchy.indexOf(currentRole);

  if (currentRoleIndex === -1) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // Get all roles below the current one
  const lowerRoles = roleHierarchy.slice(currentRoleIndex + 1);

  console.log("Current role:", currentRole);
  console.log("Lower roles:", lowerRoles);
  console.log("Department:", department);

  try {
    const placeholders = lowerRoles.map(() => "?").join(",");
    const [rows] = await pool.execute(
      `SELECT id, name, surname, role, department
       FROM employees_table
       WHERE department = ?
       AND role IN (${placeholders})`,
      [department, ...lowerRoles]
    );

    console.log("Fetched employees by hierarchy:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch employees by hierarchy:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get tasks by creator
router.get("/tasks/creator/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const query = `
      SELECT t.*, e.name as assignee_name, e.surname as assignee_surname, e.role as assignee_role, e.department as assignee_department
      FROM tasks t 
      LEFT JOIN employees_table e ON t.assignee_id = e.id
      WHERE t.created_by = ?
      ORDER BY t.due_date ASC
    `;
    const [tasks] = await db.query(query, [creatorId]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes/employees.js or similar
router.put("/:id/assign-supervisor", async (req, res) => {
  const { id } = req.params; // employee being assigned
  const { supervisorId } = req.body;

  if (!id || !supervisorId) {
    return res
      .status(400)
      .json({ error: "Employee ID and Supervisor ID are required." });
  }

  try {
    // 1. Update assigned_supervisor of the employee
    await db.query(
      "UPDATE employees_table SET assigned_supervisor = ? WHERE id = ?",
      [supervisorId, id]
    );

    // 2. Get existing my_assignees of the supervisor
    const [[supervisor]] = await db.query(
      "SELECT my_assignees FROM employees_table WHERE id = ?",
      [supervisorId]
    );

    let assignees = supervisor.my_assignees
      ? supervisor.my_assignees.split(",")
      : [];

    if (!assignees.includes(id.toString())) {
      assignees.push(id.toString());
    }

    // 3. Update my_assignees
    await db.query("UPDATE employees_table SET my_assignees = ? WHERE id = ?", [
      assignees.join(","),
      supervisorId,
    ]);

    res.json({ message: "Supervisor and assignee updated successfully." });
  } catch (err) {
    console.error("Error assigning supervisor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Express route
// routes/employees.js
router.get("/:id/hierarchy-assignees", async (req, res) => {
  const { id } = req.params;

  try {
    const visited = new Set();
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (!visited.has(currentId)) {
        visited.add(currentId);

        const [rows] = await db.query(
          "SELECT my_assignees FROM employees_table WHERE id = ?",
          [currentId]
        );

        if (rows.length && rows[0].my_assignees) {
          const assigneeIds = rows[0].my_assignees
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id !== "");

          queue.push(...assigneeIds);
        }
      }
    }

    visited.delete(id); // Remove self
    res.json({ assigneeIds: Array.from(visited) });
  } catch (err) {
    console.error("Error fetching assignees hierarchy:", err);
    res.status(500).json({ error: "Failed to fetch assignees hierarchy" });
  }
});

// Route to get all pending forms
router.get("/new/pendingForms", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT ed.*, et.empID FROM employee_details ed JOIN employees_table et ON ed.employee_id = et.id"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pending forms:", err);
    res.status(500).json({ error: "Failed to fetch pending forms" });
  }
});

// Route to approve a form
router.post("/approveForm/:id", async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection(); // <-- Get a dedicated connection
  try {
    await connection.beginTransaction();

    // Step 1: Update employee_details
    await connection.execute(
      "UPDATE employee_details SET onboarded = 1 WHERE id = ?",
      [id]
    );

    // Step 2: Get employee_id from employee_details
    const [rows] = await connection.execute(
      "SELECT employee_id FROM employee_details WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Employee not found" });
    }

    const employeeId = rows[0].employee_id;

    // Step 3: Update employees_table using employee_id
    await connection.execute(
      "UPDATE employees_table SET onboarded = 1 WHERE id = ?",
      [employeeId]
    );

    await connection.commit();
    res.json({ message: "Form approved successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error approving form:", err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release(); // Always release the connection
  }
});

// Route to reject onboarding form
router.post("/rejectForm/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Simply mark it as reviewed (still onboarded = 0)
    // You can also add a column like 'rejected = 1' if you want to track rejections
    await db.execute("UPDATE employee_details SET onboarded = 0 WHERE id = ?", [
      id,
    ]);

    res.json({ message: "Form rejected successfully" });
  } catch (err) {
    console.error("Error rejecting form:", err);
    res.status(500).json({ error: err.message });
  }
});

// Express route example
router.put(
  "/updateDetails/:id",
  onboardingUpload.fields(documentFields),
  async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const files = req.files;

    try {
      // Add file paths to data object
      if (files) {
        for (const field of documentFields) {
          if (files[field.name]) {
            data[field.name] = "onboarding/" + files[field.name][0].filename;
          }
        }
      }

      const fields = Object.keys(data)
        .filter((key) => data[key] !== undefined && data[key] !== null)
        .map((field) => `${field} = ?`)
        .join(", ");
      const values = Object.values(data).filter(
        (val) => val !== undefined && val !== null
      );

      if (fields.length === 0) {
        return res.json({ message: "No details to update." });
      }

      await db.execute(`UPDATE employee_details SET ${fields} WHERE id = ?`, [
        ...values,
        id,
      ]);
      res.json({ message: "Updated successfully" });
    } catch (err) {
      console.error("Error updating details:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Route to change employee credentials
router.post("/changeCredentials", async (req, res) => {
  const { currentUsername, newUsername, currentPassword, newPassword } =
    req.body;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM employees_table WHERE username = ? AND password = ?",
      [currentUsername, currentPassword]
    );
    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Current username or password is incorrect" });
    }
    await db.execute(
      "UPDATE employees_table SET username = ?, password = ? WHERE username = ?",
      [newUsername, newPassword, currentUsername]
    );
    res.json({ message: "Credentials updated successfully" });
  } catch (err) {
    console.error("Error changing credentials:", err);
    res.status(500).json({ error: err.message });
  }
});
router.patch("/details/:id", async (req, res) => {
  const { id } = req.params; // ✅ Use id
  const data = req.body;

  const detailsFields = [
    "full_name",
    "email",
    "contact_number",
    "marital_status",
    "designation",
    "location",
    "pin_code",
    "bank_account_number",
    "ifsc_code",
    "resume_path",
    "educational_certificates_path",
    "relieving_letter_path",
    "appointment_letter_path",
    "experience_letter_path",
    "pay_slips_path",
    "passport_photo_path",
    "aadhar_card_path",
    "pan_card_path",
    "bank_statement_path",
  ];
  const employeesFields = [
    "role",
    "department",
    "email",
    "empID",
    "salary",
    "state",
    "district",
    "leaves_taken",
    "username",
    "password",
    "gender",
  ];

  const detailsUpdates = [];
  const detailsValues = [];
  const employeesUpdates = [];
  const employeesValues = [];

  for (const key in data) {
    if (detailsFields.includes(key)) {
      detailsUpdates.push(`${key} = ?`);
      detailsValues.push(data[key]);
    }
    if (employeesFields.includes(key)) {
      employeesUpdates.push(`${key} = ?`);
      employeesValues.push(data[key]);
    }
  }

  try {
    if (detailsUpdates.length > 0) {
      await db.execute(
        `UPDATE employee_details SET ${detailsUpdates.join(
          ", "
        )} WHERE employee_id = ?`,
        [...detailsValues, id]
      );
    }

    if (employeesUpdates.length > 0) {
      await db.execute(
        `UPDATE employees_table SET ${employeesUpdates.join(
          ", "
        )} WHERE id = ?`,
        [...employeesValues, id]
      );
    }

    const [rows] = await db.execute(
      `SELECT 
        d.full_name,
        d.email AS personal_email,
        d.contact_number,
        d.marital_status,
        d.designation,
        d.location,
        d.pin_code,
        d.bank_account_number,
        d.ifsc_code,
        d.resume_path,
        d.educational_certificates_path,
        d.relieving_letter_path,
        d.appointment_letter_path,
        d.experience_letter_path,
        d.pay_slips_path,
        d.passport_photo_path,
        d.aadhar_card_path,
        d.pan_card_path,
        d.bank_statement_path,
        e.role,
        e.department,
        e.email AS company_email,
        e.empID,
        e.salary,
        e.state,
        e.district,
        e.leaves_taken,
        e.username,
        e.password,
        e.gender
      FROM employee_details d
      JOIN employees_table e ON d.employee_id = e.id
      WHERE d.employee_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error updating employee details:", err);
    res.status(500).json({ error: err.message });
  }
});
router.get("/:empID/sales-stats", async (req, res) => {
  const { empID } = req.params;

  try {
    // 1. Get internal numeric id from empID
    const [[empRow]] = await db.query(
      "SELECT id FROM employees_table WHERE empID = ?",
      [empID]
    );

    if (!empRow) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const visited = new Set();
    const queue = [empRow.id];

    // 2. Traverse hierarchy using internal `id`
    while (queue.length > 0) {
      const currentId = queue.shift();

      if (!visited.has(currentId)) {
        visited.add(currentId);

        const [rows] = await db.query(
          "SELECT my_assignees FROM employees_table WHERE id = ?",
          [currentId]
        );

        if (rows.length && rows[0].my_assignees) {
          const assigneeIds = rows[0].my_assignees
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

          queue.push(...assigneeIds);
        }
      }
    }

    const allIds = [...visited];
    const placeholders = allIds.map(() => "?").join(",");

    // 3. Get empIDs from those internal IDs
    const [empIdRows] = await db.query(
      `SELECT empID FROM employees_table WHERE id IN (${placeholders})`,
      allIds
    );

    const allEmpIDs = empIdRows.map((row) => row.empID);
    const empIDPlaceholders = allEmpIDs.map(() => "?").join(",");

    // 4. Query sales using empID now
    const [result] = await db.query(
      `SELECT COUNT(*) AS salesCount, 
              COALESCE(SUM(total_package_value), 0) AS totalRevenue 
       FROM sales_punches 
       WHERE employee_id IN (${empIDPlaceholders}) AND isapproved = 1`,
      allEmpIDs
    );

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching team sales stats:", err);
    res.status(500).json({ error: "Failed to fetch team sales stats" });
  }
});

router.get("/:empID/session-stats", async (req, res) => {
  const { empID } = req.params;

  try {
    // 1. Get internal numeric id from empID
    const [[empRow]] = await db.query(
      "SELECT id FROM employees_table WHERE empID = ?",
      [empID]
    );

    if (!empRow) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const visited = new Set();
    const queue = [empRow.id];

    // 2. Traverse hierarchy using internal `id`
    while (queue.length > 0) {
      const currentId = queue.shift();

      if (!visited.has(currentId)) {
        visited.add(currentId);

        const [rows] = await db.query(
          "SELECT my_assignees FROM employees_table WHERE id = ?",
          [currentId]
        );

        if (rows.length && rows[0].my_assignees) {
          const assigneeIds = rows[0].my_assignees
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));

          queue.push(...assigneeIds);
        }
      }
    }

    const allIds = [...visited];
    const placeholders = allIds.map(() => "?").join(",");

    // 3. Get empIDs from those internal IDs
    const [empIdRows] = await db.query(
      `SELECT empID FROM employees_table WHERE id IN (${placeholders})`,
      allIds
    );

    const allEmpIDs = empIdRows.map((row) => row.empID);
    const empIDPlaceholders = allEmpIDs.map(() => "?").join(",");

    // 4. Query sessions using empID
    const [result] = await db.query(
      `SELECT
         SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS upcoming,
         SUM(CASE WHEN status = 'purchased' THEN 1 ELSE 0 END) AS purchased,
         SUM(CASE WHEN status = 'follow up' THEN 1 ELSE 0 END) AS followUp,
         SUM(CASE WHEN status = 'not interested' THEN 1 ELSE 0 END) AS rejected,
         SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded
       FROM direct_sessions
       WHERE employee_id IN (${empIDPlaceholders})`,
      allEmpIDs
    );

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching team session stats:", err);
    res.status(500).json({ error: "Failed to fetch team session stats" });
  }
});

// GET /api/notifications/unread-count/:employeeId
router.get("/notifications/unread-count/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE employee_id = ? AND is_read = 0`,
      [employeeId]
    );

    res.json({ count: result[0].count });
  } catch (err) {
    console.error("Failed to fetch unread notification count:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch unread notification count" });
  }
});
// /routes/calendar.js or similar
router.get("/new-events/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.start_time
   FROM calendar_events e
   JOIN event_attendees a ON a.event_id = e.id
   WHERE a.employee_id = ?
     AND a.is_read = 0
     AND e.start_time >= CURDATE()`,
      [employeeId] // ← Make sure this is defined
    );

    res.json(rows); // returns unread calendar events for red dot
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch new calendar events" });
  }
});
router.put("/mark-read/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  try {
    await pool.query(
      `UPDATE event_attendees 
       SET is_read = 1 
       WHERE employee_id = ? AND is_read = 0`,
      [employeeId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark events as read" });
  }
});
// PUT /api/employees/tasks/creator-remark/:id
router.put("/tasks/creator-remark/:id", async (req, res) => {
  const { id } = req.params;
  const { creator_remarks } = req.body;

  try {
    const result = await db.query(
      'UPDATE tasks SET creator_remarks = ? WHERE id = ? AND status = "Completed"',
      [creator_remarks, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating creator remarks:", error);
    res.status(500).json({ error: "Failed to update remark" });
  }
});
// DELETE employee by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM employees_table WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
