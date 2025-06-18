import express from 'express';
import db from '../db.js';

const router = express.Router();

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

// Get unread message count for an employee
router.get('/unread/:employeeId', async (req, res) => {
  try {
    const [result] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = ? AND is_read = false`,
      [req.params.employeeId]
    );

    res.json({ count: result[0].count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 