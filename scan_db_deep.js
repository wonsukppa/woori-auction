const { Client } = require('pg');

async function scanDB() {
  const client = new Client({
    host: '192.168.1.8',
    user: 'ydh110',
    password: '7044ydh',
    database: 'woori_auction',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to Mac Mini DB for scanning...');
    
    // Scan 100 rows to find price patterns
    const res = await client.query('SELECT * FROM auctions ORDER BY id DESC LIMIT 100');
    
    console.log('--- DB SCAN REPORT ---');
    res.rows.forEach((row, i) => {
      console.log(`[Row ${i+1}] ID: ${row.id}`);
      console.log(`Case: ${row.case_number}`);
      console.log(`Loc: ${row.location}`);
      console.log(`Appraisal: ${row.appraisal_price}`);
      console.log(`Min: ${row.minimum_price}`);
      console.log(`Status: ${row.status}`);
      console.log('----------------------');
    });

  } catch (err) {
    console.error('Scan Error:', err.stack);
  } finally {
    await client.end();
  }
}

scanDB();
