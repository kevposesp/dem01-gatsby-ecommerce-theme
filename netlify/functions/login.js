import { neon } from '@netlify/neon';
const { verifyPassword, generateToken } = require('./utils/auth');

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
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const users = await sql(
      'SELECT id, first_name, last_name, email, password_hash, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Account is inactive' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValidPassword = verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = generateToken(user.id, user.email);

    const rolesResult = await sql(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const roles = rolesResult.map((r) => r.name);

    return new Response(JSON.stringify({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        roles
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      error: 'Login failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/auth/login'
};
