import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
  try {
    // 로컬 SQLite DB 연결
    const db = await open({
      filename: path.join(process.cwd(), 'woori_auction.db'),
      driver: sqlite3.Database
    });

    const auctions = await db.all('SELECT * FROM auctions');
    await db.close();

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'DB Fetch Error' }, { status: 500 });
  }
}
