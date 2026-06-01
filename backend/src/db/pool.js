import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_mosquito',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
});

// Helper: chama uma stored procedure e retorna todos os result sets
export async function callProc(name, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${name}(${placeholders})`;
  const [results] = await pool.query(sql, params);
  return results;
}

// Helper: lê uma view com filtro opcional
export async function queryView(viewName, where = '', params = []) {
  const sql = `SELECT * FROM ${viewName}${where ? ' WHERE ' + where : ''}`;
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;
