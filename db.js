import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv-db1872.hstgr.io',
  user: process.env.DB_USER || 'u393899762_emstheaacharya',
  password: process.env.DB_PASSWORD || 'Yash0770@',
  database: process.env.DB_NAME || 'u393899762_emstheaacharya',
});

export default pool;

