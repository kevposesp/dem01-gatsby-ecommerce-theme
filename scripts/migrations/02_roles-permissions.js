require('dotenv/config');
const { neon } = require('@netlify/neon');

const sql = neon(process.env.NETLIFY_DATABASE_URL);

async function migrateRolesAndPermissions() {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id)
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    await sql(`
      CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
    `);
    await sql(`
      CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
    `);

    await sql(`
      INSERT INTO roles (name, description)
      VALUES
        ('customer', 'Default role for customers'),
        ('admin', 'Role with administrative permissions')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('Roles and permissions tables created/updated successfully');
  } catch (error) {
    console.error('Error creating roles/permissions tables:', error);
    process.exit(1);
  }
}

migrateRolesAndPermissions();
