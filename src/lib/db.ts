import { Pool } from 'pg';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Supabase 등 클라우드 DB용 SSL 설정
      }
    : {
        user: 'ydh110',
        host: '192.168.1.8',
        database: 'woori_auction',
        password: '7044ydh',
        port: 5432,
        connectionTimeoutMillis: 3000,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle DB pool', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

