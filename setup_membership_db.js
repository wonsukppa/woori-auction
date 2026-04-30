const { Client } = require('pg');

const client = new Client({
  host: '192.168.1.8',
  user: 'ydh110',
  password: '7044ydh',
  database: 'woori_auction',
  port: 5432,
});

async function setup() {
  try {
    await client.connect();
    console.log('Connecting to DB for membership setup...');
    
    // Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        grade TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Analysis History Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        property_id INTEGER,
        type TEXT,
        result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Membership DB tables created successfully!');
  } catch (err) {
    console.error('❌ DB Setup Error:', err);
  } finally {
    await client.end();
  }
}

setup();
