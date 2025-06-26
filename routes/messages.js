import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/unread/:receiverId', async (req, res) => {
  const { receiverId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT sender_id, COUNT(*) as unreadCount
       FROM messages
       WHERE receiver_id = ? AND is_read = 0
       GROUP BY sender_id`,
      [receiverId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread messages" });
  }
});
// Get messages between two employees
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    const [messages] = await db.execute(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [senderId, receiverId, receiverId, senderId]
    );

    // Mark messages as read
    await db.execute(
      `UPDATE messages 
       SET is_read = true 
       WHERE receiver_id = ? AND sender_id = ? AND is_read = false`,
      [senderId, receiverId]
    );

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.execute(
      `INSERT INTO messages (sender_id, receiver_id, message) 
       VALUES (?, ?, ?)`,
      [sender_id, receiver_id, message]
    );

    // Fetch the created message with sender and receiver details
    const [newMessage] = await db.execute(
      `SELECT m.*, 
              s.name as sender_name, s.surname as sender_surname,
              r.name as receiver_name, r.surname as receiver_surname
       FROM messages m
       JOIN employees_table s ON m.sender_id = s.id
       JOIN employees_table r ON m.receiver_id = r.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    if (!newMessage || newMessage.length === 0) {
      throw new Error('Failed to fetch created message');
    }

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ This is correct



// PUT /api/messages/mark-read/:sender_id/:receiver_id
router.put('/mark-read/:sender_id/:receiver_id', async (req, res) => {
  const { sender_id, receiver_id } = req.params;

  try {
    await db.query(
      `UPDATE messages 
       SET is_read = 1 
       WHERE sender_id = ? AND receiver_id = ?`,
      [sender_id, receiver_id] // ✅ Fixed order
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// GET /api/messages/broadcast/:department
router.get('/broadcast/:department', async (req, res) => {
  const { department } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM broadcast_messages WHERE department = ? ORDER BY created_at ASC',
      [department]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch broadcast messages' });
  }
});

// POST /api/messages/broadcast
router.post('/broadcast', async (req, res) => {
  const { sender_id, department, message } = req.body;
  if (!sender_id || !department || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Optionally fetch sender's name for display
  let sender_name = '';
  try {
    const [empRows] = await db.query('SELECT name, surname FROM employees_table WHERE id = ?', [sender_id]);
    if (empRows.length > 0) {
      sender_name = empRows[0].name + ' ' + empRows[0].surname;
    }
  } catch (err) {
    // fallback: leave sender_name empty
  }

  try {
    const [result] = await db.query(
      'INSERT INTO broadcast_messages (sender_id, sender_name, department, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [sender_id, sender_name, department, message]
    );
    // Return the inserted message
    res.json({
      id: result.insertId,
      sender_id,
      sender_name,
      department,
      message,
      created_at: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send broadcast message' });
  }
});

export default router; 