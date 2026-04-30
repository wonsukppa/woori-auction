import { NextResponse } from 'next/server';
import { Client } from 'pg';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const client = new Client({
    host: '192.168.1.8',
    user: 'ydh110',
    password: '7044ydh',
    database: 'woori_auction',
    port: 5432,
  });

  try {
    await client.connect();
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const res = await client.query(
      'SELECT id, email, name, grade FROM users WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const user = res.rows[0];

    // In a real app, you would set a Cookie or Session here
    return NextResponse.json({ 
      message: '로그인 성공', 
      user: { id: user.id, email: user.email, name: user.name, grade: user.grade } 
    });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  } finally {
    await client.end();
  }
}
