import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  let response;
  try {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const res = await query(
      'SELECT id, email, name, grade FROM users WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );

    if (res.rows.length === 0) {
      response = NextResponse.json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    } else {
      const user = res.rows[0];
      response = NextResponse.json({ 
        message: '로그인 성공', 
        user: { id: user.id, email: user.email, name: user.name, grade: user.grade } 
      });
    }
  } catch (err) {
    console.error('Login Error:', err);
    response = NextResponse.json({ error: '서버 오류가 발생했습니다. (DB 연결 실패 등)' }, { status: 500 });
  }

  return response;
}
