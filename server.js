import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import db from "./db.js";
import dotenv from "dotenv";
dotenv.config();
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

import { google } from "googleapis";
import cookieSession from "cookie-session";
import employeeRoutes from "./routes/employees.js";
import applicationRoutes from "./routes/applications.js";
import leaveRoutes from "./routes/leaves.js";
import attendanceRoutes from "./routes/attendance.js";
import messagesRouter from "./routes/messages.js";
import tasksRouter from "./routes/tasks.js";
import hrLoginRoutes from "./routes/hrLogin.js";
import salesPunchRoutes from "./routes/salespunch.js";
import directSessionRoutes from "./routes/directsessions.js";
import salesPunchApprovalRoutes from "./routes/salespunchapproval.js";
import newOnboardingRouter from "./routes/newonboarding.js";
import lol from "./routes/lol.js"; // Assuming this is a test route, you can remove it later
import loginLogsRoutes from "./routes/loginLogs.js";
import salaryRoutes from "./routes/salary.js";
import { v4 as uuidv4 } from 'uuid';

// ...

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: ["http://localhost:5173", "https://theaacharya.in"],
  credentials: true
}));
app.use(express.json());
app.use(cookieSession({ name: "session", keys: ["secret"] }));

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    console.log("Callback received with query:", req.query); // <-- Log the query parameters
    if (!code) return res.status(400).send("Missing authorization code");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;

    res.send("Google authentication successful! You can now use the API.");
  } catch (err) {
    console.error("OAuth callback error:", err); // <-- Catch detailed error here
    res.status(500).send("Authentication failed");
  }
});


app.post("/api/create-meet", async (req, res) => {
  try {
    if (!req.session.tokens) return res.status(401).send("Not authenticated");
    oauth2Client.setCredentials(req.session.tokens);

    // 🔥 Move this line **inside** the try block:
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { summary, start, end, attendees } = req.body;

    if (!summary || !start || !end || !Array.isArray(attendees)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = {
      summary,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData.entryPoints.find(
      (ep) => ep.entryPointType === "video"
    )?.uri;

    if (!meetLink)
      return res.status(500).json({ error: "Failed to fetch meet link" });

    res.json({ meetLink });
  } catch (err) {
    console.error("Google Meet creation failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/api/create-interview-meet", async (req, res) => {
  try {
    if (!req.session.tokens) return res.status(401).send("Not authenticated");
    oauth2Client.setCredentials(req.session.tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { summary, start, attendees } = req.body;

    if (!summary || !start || !Array.isArray(attendees)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const startDateTime = new Date(start);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 minutes later

   const event = {
  summary: 'Candidate Interview',
  start: {
    dateTime: startDateTime.toISOString(),
    timeZone: 'Asia/Kolkata'
  },
  end: {
    dateTime: endDateTime.toISOString(),
    timeZone: 'Asia/Kolkata'
  },
  attendees: req.body.attendees || [],
  conferenceData: {
    createRequest: {
      requestId: uuidv4(),
      conferenceSolutionKey: {
        type: 'hangoutsMeet'
      }
    }
  }
};


    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData.entryPoints.find(
      (ep) => ep.entryPointType === "video"
    )?.uri;

    if (!meetLink)
      return res.status(500).json({ error: "Failed to fetch meet link" });

    res.json({ meetLink });
  } catch (err) {
    console.error("Google Meet creation failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Runs every 3 hours at minute 0 (e.g., 00:00, 03:00, 06:00, etc.)
cron.schedule("0 */3 * * *", async () => {
  try {
    await db.query(`
      UPDATE employees_table 
      SET isActive = 0, lastLogout = NOW() 
      WHERE isActive = 1 AND last_active < NOW() - INTERVAL 3 HOUR
    `);
    console.log("Inactive users cleaned up (3 hours).");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
});

app.use("/api/employees", employeeRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/messages", messagesRouter);
app.use("/api/employees/tasks", tasksRouter);
app.use("/api/hr", hrLoginRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/resumes",
  express.static(path.join(__dirname, "uploads/resumes"))
);
app.use("/api/salespunch", salesPunchRoutes);
app.use("/api/directsession", directSessionRoutes);
app.use("/api/salespunches", salesPunchApprovalRoutes);
app.use(
  "/uploads/directsession",
  express.static(path.join(__dirname, "uploads/directsession"))
);
app.use("/api/new/onboarding", newOnboardingRouter);
app.use("/api/employees/logout", express.raw({ type: "application/json" }));
app.use("/api/employees/lol", lol); // Test route, can be removed later
app.use("/api/login-logs", loginLogsRoutes);
app.use("/api/salary", salaryRoutes);

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
