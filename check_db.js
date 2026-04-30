const { Client } = require('pg');

async function checkTable() {
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
    
    // List tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));

    // If 'properties' or similar exists, show columns
    for (let table of res.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.table_name]);
      console.log(`Columns of ${table.table_name}:`, cols.rows.map(c => `${c.column_name}(${c.data_type})`).join(', '));
    }

  } catch (err) {
    console.error('DB Connection Error:', err.stack);
  } finally {
    await client.end();
  }
}

checkTable();
