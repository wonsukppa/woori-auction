import { Pool } from 'pg';

const pool = new Pool({
  user: 'ydh110',
  host: '192.168.1.8',
  database: 'woori_auction',
  password: '7044ydh',
  port: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
