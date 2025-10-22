import { neon } from '@netlify/neon';
const { verifyToken, extractBearerToken, hashPassword, verifyPassword } = require('./utils/auth');

const sql = neon();

export default async (req, context) => {
  const authHeader = req.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method === 'GET') {
    try {
      const users = await sql(
        'SELECT id, first_name, last_name, email, email_verified, created_at, updated_at FROM users WHERE id = $1',
        [payload.userId]
      );

      if (users.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const user = users[0];

      const rolesResult = await sql(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );

      const roles = rolesResult.map((r) => r.name);

      return new Response(JSON.stringify({
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          roles
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      const { firstName, lastName, email, currentPassword, newPassword } = body;

      const users = await sql(
        'SELECT password_hash FROM users WHERE id = $1',
        [payload.userId]
      );

      if (users.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (firstName) {
        updates.push(`first_name = $${paramCount}`);
        values.push(firstName);
        paramCount++;
      }

      if (lastName) {
        updates.push(`last_name = $${paramCount}`);
        values.push(lastName);
        paramCount++;
      }

      if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return new Response(JSON.stringify({ key: 'email', error: 'Invalid email format' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const existingEmail = await sql(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email.toLowerCase(), payload.userId]
        );

        if (existingEmail.length > 0) {
          return new Response(JSON.stringify({ key: 'email', error: 'Email already in use' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        updates.push(`email = $${paramCount}`);
        values.push(email.toLowerCase());
        paramCount++;
      }

      if (newPassword) {
        if (!currentPassword) {
          return new Response(JSON.stringify({ 
            key: 'currentPassword',
            error: 'Current password is required to change password' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const isValidPassword = verifyPassword(currentPassword, users[0].password_hash);
        if (!isValidPassword) {
          return new Response(JSON.stringify({
            key: 'currentPassword',
            error: 'Current password is incorrect' 
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!/(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) {
          return new Response(JSON.stringify({ 
            key: 'password',
            error: 'Password must have at least 8 characters, 1 lowercase, 1 uppercase and 1 numeric character' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const newPasswordHash = hashPassword(newPassword);
        updates.push(`password_hash = $${paramCount}`);
        values.push(newPasswordHash);
        paramCount++;
      }

      if (updates.length === 0) {
        return new Response(JSON.stringify({ error: 'No fields to update' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(payload.userId);

      const result = await sql(
        `UPDATE users SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING id, first_name, last_name, email, updated_at`,
        values
      );

      const rolesResult = await sql(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [payload.userId]
      );

      const roles = rolesResult.map((r) => r.name);

      return new Response(JSON.stringify({
        message: 'Profile updated successfully',
        user: {
          id: result[0].id,
          firstName: result[0].first_name,
          lastName: result[0].last_name,
          email: result[0].email,
          updatedAt: result[0].updated_at,
          roles
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = {
  path: '/api/auth/profile'
};
