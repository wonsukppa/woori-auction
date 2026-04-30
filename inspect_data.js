const { Client } = require('pg');

async function inspectData() {
  const client = new Client({
    host: '192.168.1.8',
    user: 'ydh110',
    password: '7044ydh',
    database: 'woori_auction',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to Mac Mini DB');
    
    // Fetch first 5 rows to see data format
    const res = await client.query('SELECT * FROM auctions LIMIT 5');
    console.log('Sample Data:', JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error('Data Inspection Error:', err.stack);
  } finally {
    await client.end();
  }
}

inspectData();
