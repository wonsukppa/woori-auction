import { NextResponse } from 'next/server';
import { Client } from 'pg';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const client = new Client({
    host: '192.168.1.8',
    user: 'ydh110',
    password: '7044ydh',
    database: 'woori_auction',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Check if user exists
    const checkRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkRes.rows.length > 0) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 });
    }

    // Password Hashing (Simple for MVP, recommend bcrypt for production)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Insert User
    await client.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
      [email, hashedPassword, name || '']
    );

    return NextResponse.json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    console.error('Signup Error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  } finally {
    await client.end();
  }
}
