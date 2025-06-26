import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  port: process.env.DB_PORT || 52578,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'OMRuLhpffBaUNAXiQDBydDMGLEkqlNDq',
  database: process.env.DB_NAME || 'railway',
});

export default pool;

