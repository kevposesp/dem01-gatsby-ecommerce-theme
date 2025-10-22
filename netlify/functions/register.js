import { neon } from '@netlify/neon';
const { hashPassword } = require('./utils/auth');

const sql = neon();

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ 
        error: 'All fields are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!/(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      return new Response(JSON.stringify({ 
        error: 'Password must have at least 8 characters, 1 lowercase, 1 uppercase and 1 numeric character' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await sql(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Email already registered' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordHash = hashPassword(password);

    const result = await sql(
      `INSERT INTO users (first_name, last_name, email, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, email, created_at`,
      [firstName, lastName, email.toLowerCase(), passwordHash]
    );

    await sql(
      `INSERT INTO user_roles (user_id, role_id) 
       VALUES ($1, (SELECT id FROM roles WHERE name = $2))`,
      [result[0].id, 'customer']
    );

    return new Response(JSON.stringify({
      message: 'User registered successfully',
      user: {
        id: result[0].id,
        firstName: result[0].first_name,
        lastName: result[0].last_name,
        email: result[0].email,
        createdAt: result[0].created_at
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Registration failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/auth/register'
};
