const { Client } = require('pg');

const realData = [
  { case_number: "2023타경6292", appraised_value: "2.7억" },
  { case_number: "2024타경1775", appraised_value: "6.1억" },
  { case_number: "2024타경4996", appraised_value: "0.4억" },
  { case_number: "2024타경6060", appraised_value: "3.3억" },
  { case_number: "2024타경6213", appraised_value: "2.0억" },
  { case_number: "2024타경107956", appraised_value: "5.3억" },
  { case_number: "2024타경108737", appraised_value: "18.8억" },
  { case_number: "2024타경109242", appraised_value: "16.7억" },
  { case_number: "2024타경110204", appraised_value: "2.9억" }
];

async function syncRealPrices() {
  const client = new Client({
    host: '192.168.1.8',
    user: 'ydh110',
    password: '7044ydh',
    database: 'woori_auction',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to Mac Mini DB for price synchronization...');

    for (const item of realData) {
      const query = `
        UPDATE auctions 
        SET minimum_price = $1 
        WHERE case_number LIKE $2
      `;
      // Use LIKE to match partial case numbers (e.g. handle (1), (2) suffixes)
      await client.query(query, [item.appraised_value, `%${item.case_number}%`]);
      console.log(`Updated Price for ${item.case_number}: ${item.appraised_value}`);
    }

    console.log('--- Price Synchronization Complete! ---');

  } catch (err) {
    console.error('Sync Error:', err.stack);
  } finally {
    await client.end();
  }
}

syncRealPrices();
